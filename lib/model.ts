import type { Dataset, Employee } from "./types";

export type CatSpec = { field: keyof Employee; values: string[] };

export type TrainedModel = {
  featureNames: string[];
  numFields: (keyof Employee)[];
  numCount: number;
  catSpecs: CatSpec[];
  numMedians: Record<string, number>;
  means: number[];
  stds: number[];
  W: number[];
  b: number;
  trainSize: number;
  testSize: number;
  usableSize: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  vectorize: (r: Partial<Employee>) => number[];
  standardize: (row: number[]) => number[];
  predict: (r: Partial<Employee>) => {
    probability: number;
    contributions: { name: string; contrib: number }[];
  };
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function median(arr: number[]): number {
  const s = arr.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// deterministic PRNG for reproducible train/test split
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Trains a logistic-regression attrition classifier entirely in-browser,
 * faithful to the original static implementation: median-imputed & standardized
 * numeric features, one-hot categoricals, seeded 80/20 split, batch gradient
 * descent with a small L2 penalty. Employment Status is intentionally excluded
 * because it restates Attrition and would leak the label.
 */
export function trainModel(dataset: Dataset): TrainedModel {
  const { records, depts, cities, workModes, maritals, edus } = dataset;

  const catSpecs: CatSpec[] = [
    { field: "dept", values: depts },
    { field: "city", values: cities },
    { field: "marital", values: maritals },
    { field: "edu", values: edus },
    { field: "workMode", values: workModes },
  ];
  const numFields: (keyof Employee)[] = [
    "age",
    "salary",
    "tenure",
    "trainHrs",
    "perf",
    "satisfaction",
  ];

  const numMedians: Record<string, number> = {};
  numFields.forEach((f) => {
    numMedians[f as string] = median(
      records.filter((r) => r[f] !== null).map((r) => r[f] as number),
    );
  });

  const featureNames: string[] = [];
  numFields.forEach((f) => featureNames.push(f as string));
  featureNames.push("salaryMissing");
  featureNames.push("overtime");
  featureNames.push("genderMale");
  catSpecs.forEach((spec) =>
    spec.values.forEach((v) => featureNames.push(`${String(spec.field)}:${v}`)),
  );

  function vectorize(r: Partial<Employee>): number[] {
    const vec: number[] = [];
    numFields.forEach((f) => {
      const v = r[f];
      vec.push(v !== null && v !== undefined ? (v as number) : numMedians[f as string]);
    });
    vec.push(r.salary === null || r.salary === undefined ? 1 : 0);
    vec.push(r.overtime === "Yes" ? 1 : 0);
    vec.push(r.gender === "Male" ? 1 : 0);
    catSpecs.forEach((spec) => {
      spec.values.forEach((v) => vec.push(r[spec.field] === v ? 1 : 0));
    });
    return vec;
  }

  const usable = records.filter(
    (r) => r.attrition === "Yes" || r.attrition === "No",
  );
  const X = usable.map(vectorize);
  const y = usable.map((r) => (r.attrition === "Yes" ? 1 : 0));

  const numCount = numFields.length;
  const means = new Array(numCount).fill(0);
  const stds = new Array(numCount).fill(1);
  for (let j = 0; j < numCount; j++) {
    const col = X.map((row) => row[j]);
    const m = col.reduce((a, b) => a + b, 0) / col.length;
    const v = col.reduce((a, b) => a + (b - m) * (b - m), 0) / col.length;
    means[j] = m;
    stds[j] = Math.sqrt(v) || 1;
  }

  function standardize(row: number[]): number[] {
    const out = row.slice();
    for (let j = 0; j < numCount; j++) out[j] = (out[j] - means[j]) / stds[j];
    return out;
  }
  const Xs = X.map(standardize);

  const rng = mulberry32(42);
  const idx = Xs.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const splitAt = Math.floor(idx.length * 0.8);
  const trainIdx = idx.slice(0, splitAt);
  const testIdx = idx.slice(splitAt);

  const nFeat = featureNames.length;
  const W = new Array(nFeat).fill(0);
  let b = 0;
  const lr = 0.15;
  const lambda = 0.001;
  const epochs = 350;
  const nTrain = trainIdx.length;

  for (let ep = 0; ep < epochs; ep++) {
    const gradW = new Array(nFeat).fill(0);
    let gradB = 0;
    for (const i of trainIdx) {
      const row = Xs[i];
      let z = b;
      for (let j = 0; j < nFeat; j++) z += W[j] * row[j];
      const p = sigmoid(z);
      const err = p - y[i];
      for (let j = 0; j < nFeat; j++) gradW[j] += err * row[j];
      gradB += err;
    }
    for (let j = 0; j < nFeat; j++) W[j] -= lr * (gradW[j] / nTrain + lambda * W[j]);
    b -= lr * (gradB / nTrain);
  }

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  testIdx.forEach((i) => {
    const row = Xs[i];
    let z = b;
    for (let j = 0; j < nFeat; j++) z += W[j] * row[j];
    const p = sigmoid(z);
    const pred = p >= 0.5 ? 1 : 0;
    const actual = y[i];
    if (pred === 1 && actual === 1) tp++;
    else if (pred === 1 && actual === 0) fp++;
    else if (pred === 0 && actual === 0) tn++;
    else fn++;
  });
  const accuracy = (tp + tn) / (testIdx.length || 1);
  const precision = tp / (tp + fp || 1);
  const recall = tp / (tp + fn || 1);
  const f1 = (2 * precision * recall) / (precision + recall || 1);

  function predict(r: Partial<Employee>) {
    const raw = vectorize(r);
    const stdRow = standardize(raw);
    let z = b;
    const contributions: { name: string; contrib: number }[] = [];
    for (let j = 0; j < nFeat; j++) {
      const c = W[j] * stdRow[j];
      z += c;
      contributions.push({ name: featureNames[j], contrib: c });
    }
    return { probability: sigmoid(z), contributions };
  }

  return {
    featureNames,
    numFields,
    numCount,
    catSpecs,
    numMedians,
    means,
    stds,
    W,
    b,
    trainSize: trainIdx.length,
    testSize: testIdx.length,
    usableSize: usable.length,
    metrics: { accuracy, precision, recall, f1, tp, fp, tn, fn },
    vectorize,
    standardize,
    predict,
  };
}

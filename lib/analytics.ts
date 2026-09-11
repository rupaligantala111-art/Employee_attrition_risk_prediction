import type { Dataset, Employee } from "./types";
import { avg, pct } from "./utils";

export type DashFilter = { dept: string; city: string; workMode: string };

export function filterRecords(records: Employee[], f: DashFilter): Employee[] {
  return records.filter(
    (r) =>
      (!f.dept || r.dept === f.dept) &&
      (!f.city || r.city === f.city) &&
      (!f.workMode || r.workMode === f.workMode),
  );
}

export function computeKpis(rows: Employee[]) {
  const n = rows.length;
  const attrRows = rows.filter((r) => r.attrition === "Yes" || r.attrition === "No");
  const attrYes = attrRows.filter((r) => r.attrition === "Yes").length;
  const ages = rows.filter((r) => r.age !== null).map((r) => r.age as number);
  const sats = rows.filter((r) => r.satisfaction !== null).map((r) => r.satisfaction as number);
  const tenures = rows.filter((r) => r.tenure !== null).map((r) => r.tenure as number);
  const otYes = rows.filter((r) => r.overtime === "Yes").length;
  const otKnown = rows.filter((r) => r.overtime === "Yes" || r.overtime === "No").length;

  return [
    { lbl: "Total Employees", val: n.toLocaleString(), sub: "in current filter", tone: "neutral" as const },
    {
      lbl: "Attrition Rate",
      val: attrRows.length ? pct(attrYes, attrRows.length).toFixed(1) + "%" : "—",
      sub: `${attrYes.toLocaleString()} of ${attrRows.length.toLocaleString()} labeled`,
      tone: "bad" as const,
    },
    {
      lbl: "Avg Age",
      val: ages.length ? (avg(ages) as number).toFixed(1) + " yrs" : "—",
      sub: `${ages.length.toLocaleString()} valid records`,
      tone: "neutral" as const,
    },
    {
      lbl: "Avg Tenure",
      val: tenures.length ? (avg(tenures) as number).toFixed(1) + " yrs" : "—",
      sub: `${tenures.length.toLocaleString()} valid records`,
      tone: "neutral" as const,
    },
    {
      lbl: "Avg Satisfaction",
      val: sats.length ? (avg(sats) as number).toFixed(2) + " / 5" : "—",
      sub: `${sats.length.toLocaleString()} valid records`,
      tone: "neutral" as const,
    },
    {
      lbl: "Overtime Rate",
      val: otKnown ? pct(otYes, otKnown).toFixed(1) + "%" : "—",
      sub: `${otKnown.toLocaleString()} valid records`,
      tone: "bad" as const,
    },
  ];
}

export function dataQuality(records: Employee[]) {
  const n = records.length;
  const validSalary = records.filter((r) => r.salary !== null).length;
  const validAge = records.filter((r) => r.age !== null).length;
  const validPerf = records.filter((r) => r.perf !== null).length;
  const validAttr = records.filter((r) => r.attrition === "Yes" || r.attrition === "No").length;
  return { n, validSalary, validAge, validPerf, validAttr };
}

export function headcountByDept(rows: Employee[], depts: string[]) {
  return depts.map((d) => ({ name: d, value: rows.filter((r) => r.dept === d).length }));
}

export function attritionRateByDept(rows: Employee[], depts: string[]) {
  return depts.map((d) => {
    const dr = rows.filter((r) => r.dept === d && (r.attrition === "Yes" || r.attrition === "No"));
    const yes = dr.filter((r) => r.attrition === "Yes").length;
    return { name: d, value: dr.length ? +pct(yes, dr.length).toFixed(1) : 0 };
  });
}

export function satisfactionSplit(rows: Employee[]) {
  return [1, 2, 3, 4, 5].map((s) => ({
    name: `Score ${s}`,
    stay: rows.filter((r) => r.satisfaction === s && r.attrition === "No").length,
    leave: rows.filter((r) => r.satisfaction === s && r.attrition === "Yes").length,
  }));
}

export function overtimeSplit(rows: Employee[]) {
  return ["Yes", "No"].map((ot) => ({
    name: `Overtime: ${ot}`,
    leave: rows.filter((r) => r.overtime === ot && r.attrition === "Yes").length,
    stay: rows.filter((r) => r.overtime === ot && r.attrition === "No").length,
  }));
}

export function workModeSplit(rows: Employee[], workModes: string[]) {
  return workModes.map((w) => ({ name: w, value: rows.filter((r) => r.workMode === w).length }));
}

export function ageDistribution(rows: Employee[]) {
  const ages = rows.filter((r) => r.age !== null).map((r) => r.age as number);
  const buckets: [number, number][] = [
    [16, 24],
    [25, 34],
    [35, 44],
    [45, 54],
    [55, 75],
  ];
  const labels = ["16-24", "25-34", "35-44", "45-54", "55+"];
  return buckets.map(([lo, hi], i) => ({
    name: labels[i],
    value: ages.filter((a) => a >= lo && a <= hi).length,
  }));
}

export function headcountByCity(rows: Employee[], cities: string[]) {
  return cities.map((c) => ({ name: c, value: rows.filter((r) => r.city === c).length }));
}

export function salaryDistribution(rows: Employee[]) {
  const salaries = rows.filter((r) => r.salary !== null).map((r) => r.salary as number);
  if (!salaries.length) return { data: [], count: 0, total: rows.length };
  const min = Math.min(...salaries);
  const max = Math.max(...salaries);
  const buckets = 8;
  const step = (max - min) / buckets || 1;
  const data: { name: string; value: number }[] = [];
  for (let i = 0; i < buckets; i++) {
    const lo = Math.round((min + i * step) / 1000);
    const hi = Math.round((min + (i + 1) * step) / 1000);
    data.push({ name: `₹${lo}K-${hi}K`, value: 0 });
  }
  salaries.forEach((s) => {
    let idx = Math.floor((s - min) / step);
    if (idx >= buckets) idx = buckets - 1;
    data[idx].value++;
  });
  return { data, count: salaries.length, total: rows.length };
}

export function datasetOptions(dataset: Dataset) {
  return {
    depts: dataset.depts,
    cities: dataset.cities,
    workModes: dataset.workModes,
    maritals: dataset.maritals,
    edus: dataset.edus,
  };
}

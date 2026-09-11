import type { Dataset, Employee, RawData } from "./types";

function uniq(records: Employee[], field: keyof Employee): string[] {
  return Array.from(
    new Set(
      records
        .map((r) => r[field])
        .filter((v) => v !== null && v !== undefined && v !== "") as string[],
    ),
  ).sort((a, b) => String(a).localeCompare(String(b)));
}

export function parseDataset(raw: RawData): Dataset {
  const { cols, rows } = raw;
  const records: Employee[] = rows.map((row) => {
    const o = {} as Record<string, string | number | null>;
    cols.forEach((c, i) => {
      o[c] = row[i];
    });
    return o as unknown as Employee;
  });

  return {
    records,
    depts: uniq(records, "dept"),
    cities: uniq(records, "city"),
    workModes: uniq(records, "workMode"),
    maritals: uniq(records, "marital"),
    edus: uniq(records, "edu"),
  };
}

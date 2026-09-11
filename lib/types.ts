export type RawData = {
  cols: string[];
  rows: (string | number | null)[][];
};

export type Employee = {
  id: string;
  name: string;
  gender: string | null;
  age: number | null;
  dept: string | null;
  title: string | null;
  hireDate: string | null;
  city: string | null;
  salary: number | null;
  marital: string | null;
  edu: string | null;
  perf: number | null;
  attrition: string | null;
  tenure: number | null;
  overtime: string | null;
  trainHrs: number | null;
  manager: string | null;
  workMode: string | null;
  promoDate: string | null;
  satisfaction: number | null;
  status: string | null;
};

export type Dataset = {
  records: Employee[];
  depts: string[];
  cities: string[];
  workModes: string[];
  maritals: string[];
  edus: string[];
};

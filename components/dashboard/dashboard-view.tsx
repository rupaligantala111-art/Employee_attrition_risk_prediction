"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { BarSingle, BarStacked, DonutChart } from "@/components/charts/charts";
import {
  ageDistribution,
  attritionRateByDept,
  computeKpis,
  filterRecords,
  headcountByCity,
  headcountByDept,
  overtimeSplit,
  salaryDistribution,
  satisfactionSplit,
  workModeSplit,
  type DashFilter,
} from "@/lib/analytics";
import { KpiGrid } from "./kpi-grid";
import { PageHeader } from "@/components/page-header";

export function DashboardView() {
  const { dataset } = useData();
  const [filter, setFilter] = useState<DashFilter>({ dept: "", city: "", workMode: "" });

  const rows = useMemo(
    () => filterRecords(dataset.records, filter),
    [dataset.records, filter],
  );

  const kpis = useMemo(() => computeKpis(rows), [rows]);
  const deptHead = useMemo(() => headcountByDept(rows, dataset.depts), [rows, dataset.depts]);
  const deptAttr = useMemo(() => attritionRateByDept(rows, dataset.depts), [rows, dataset.depts]);
  const satSplit = useMemo(() => satisfactionSplit(rows), [rows]);
  const otSplit = useMemo(() => overtimeSplit(rows), [rows]);
  const wmSplit = useMemo(() => workModeSplit(rows, dataset.workModes), [rows, dataset.workModes]);
  const ageDist = useMemo(() => ageDistribution(rows), [rows]);
  const cityHead = useMemo(() => headcountByCity(rows, dataset.cities), [rows, dataset.cities]);
  const salary = useMemo(() => salaryDistribution(rows), [rows]);

  const set = (patch: Partial<DashFilter>) => setFilter((f) => ({ ...f, ...patch }));
  const reset = () => setFilter({ dept: "", city: "", workMode: "" });
  const hasFilter = filter.dept || filter.city || filter.workMode;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Workforce Overview"
        subtitle="Live business-intelligence view of the workforce. Filter to slice every metric and chart instantly."
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Department" className="min-w-[150px] flex-1">
            <Select value={filter.dept} onChange={(e) => set({ dept: e.target.value })}>
              <option value="">All departments</option>
              {dataset.depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="City" className="min-w-[150px] flex-1">
            <Select value={filter.city} onChange={(e) => set({ city: e.target.value })}>
              <option value="">All cities</option>
              {dataset.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Work Mode" className="min-w-[150px] flex-1">
            <Select value={filter.workMode} onChange={(e) => set({ workMode: e.target.value })}>
              <option value="">All work modes</option>
              {dataset.workModes.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </Select>
          </Field>
          <button
            onClick={reset}
            disabled={!hasFilter}
            className="flex items-center gap-1.5 rounded-[10px] border border-border bg-panel-2 px-3.5 py-2.5 text-[13px] font-semibold text-muted transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </Card>

      <div className="mb-4">
        <KpiGrid kpis={kpis} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle hint="current filter">Headcount by Department</CardTitle>
          <BarSingle data={deptHead} color="#4f46e5" />
        </Card>
        <Card>
          <CardTitle hint="% who left">Attrition Rate by Department</CardTitle>
          <BarSingle data={deptAttr} color="#dc2626" unit="%" />
        </Card>
        <Card>
          <CardTitle hint="stayed vs left">Satisfaction vs Attrition</CardTitle>
          <BarStacked data={satSplit} />
        </Card>
        <Card>
          <CardTitle hint="stayed vs left">Overtime vs Attrition</CardTitle>
          <BarStacked data={otSplit} />
        </Card>
        <Card>
          <CardTitle hint="headcount">Work Mode Distribution</CardTitle>
          <DonutChart data={wmSplit} />
        </Card>
        <Card>
          <CardTitle hint="headcount">Age Distribution</CardTitle>
          <BarSingle data={ageDist} color="#7c3aed" />
        </Card>
        <Card>
          <CardTitle hint="headcount">Headcount by City</CardTitle>
          <BarSingle data={cityHead} color="#22c1c3" horizontal />
        </Card>
        <Card>
          <CardTitle hint={`${salary.count.toLocaleString()} of ${salary.total.toLocaleString()} have salary data`}>
            Salary Distribution
          </CardTitle>
          <BarSingle data={salary.data} color="#f59e0b" />
        </Card>
      </div>
    </div>
  );
}

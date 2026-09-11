"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, NumberInput, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/page-header";
import type { Employee } from "@/lib/types";

type FormState = {
  age: string;
  salary: string;
  tenure: string;
  trainHrs: string;
  perf: string;
  satisfaction: string;
  overtime: string;
  gender: string;
  dept: string;
  city: string;
  marital: string;
  edu: string;
  workMode: string;
};

const PRETTY: Record<string, string> = {
  age: "Age",
  salary: "Monthly Salary",
  tenure: "Tenure (yrs)",
  trainHrs: "Training Hours",
  perf: "Performance",
  satisfaction: "Satisfaction",
  salaryMissing: "Salary Missing",
  overtime: "Overtime",
  genderMale: "Gender (Male)",
};

function prettyFeature(name: string): string {
  if (PRETTY[name]) return PRETTY[name];
  const [field, value] = name.split(":");
  const map: Record<string, string> = {
    dept: "Dept",
    city: "City",
    marital: "Marital",
    edu: "Education",
    workMode: "Work Mode",
  };
  return `${map[field] ?? field}: ${value}`;
}

export function PredictionView() {
  const { dataset, model } = useData();

  const [form, setForm] = useState<FormState>({
    age: "35",
    salary: "45000",
    tenure: "4",
    trainHrs: "20",
    perf: "3",
    satisfaction: "3",
    overtime: "No",
    gender: dataset.records.find((r) => r.gender)?.gender ?? "Male",
    dept: dataset.depts[0] ?? "",
    city: dataset.cities[0] ?? "",
    marital: dataset.maritals[0] ?? "",
    edu: dataset.edus[0] ?? "",
    workMode: dataset.workModes[0] ?? "",
  });

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const result = useMemo(() => {
    const num = (v: string) => (v === "" ? null : Number(v));
    const record: Partial<Employee> = {
      age: num(form.age),
      salary: num(form.salary),
      tenure: num(form.tenure),
      trainHrs: num(form.trainHrs),
      perf: num(form.perf),
      satisfaction: num(form.satisfaction),
      overtime: form.overtime,
      gender: form.gender,
      dept: form.dept,
      city: form.city,
      marital: form.marital,
      edu: form.edu,
      workMode: form.workMode,
    };
    const { probability, contributions } = model.predict(record);
    const top = contributions
      .filter((c) => Math.abs(c.contrib) > 1e-4)
      .sort((a, b) => Math.abs(b.contrib) - Math.abs(a.contrib))
      .slice(0, 8);
    return { probability, top };
  }, [form, model]);

  const riskPct = result.probability * 100;
  const band =
    riskPct >= 60
      ? { label: "High Risk", tone: "bad" as const }
      : riskPct >= 35
        ? { label: "Moderate Risk", tone: "warn" as const }
        : { label: "Low Risk", tone: "good" as const };

  const maxContrib = Math.max(...result.top.map((c) => Math.abs(c.contrib)), 1e-6);

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Attrition Risk Prediction"
        subtitle="Enter an employee profile to score their attrition risk. The logistic-regression model runs live in your browser and updates as you type."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardTitle hint="updates live">Employee Profile</CardTitle>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            <Field label="Age">
              <NumberInput value={form.age} min={16} max={75} onChange={(e) => set({ age: e.target.value })} />
            </Field>
            <Field label="Monthly Salary">
              <NumberInput value={form.salary} min={0} step={1000} onChange={(e) => set({ salary: e.target.value })} />
            </Field>
            <Field label="Tenure (yrs)">
              <NumberInput value={form.tenure} min={0} max={45} onChange={(e) => set({ tenure: e.target.value })} />
            </Field>
            <Field label="Training Hours">
              <NumberInput value={form.trainHrs} min={0} onChange={(e) => set({ trainHrs: e.target.value })} />
            </Field>
            <Field label="Performance (1-5)">
              <Select value={form.perf} onChange={(e) => set({ perf: e.target.value })}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Satisfaction (1-5)">
              <Select value={form.satisfaction} onChange={(e) => set({ satisfaction: e.target.value })}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Overtime">
              <Select value={form.overtime} onChange={(e) => set({ overtime: e.target.value })}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </Select>
            </Field>
            <Field label="Gender">
              <Select value={form.gender} onChange={(e) => set({ gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </Field>
            <Field label="Department">
              <Select value={form.dept} onChange={(e) => set({ dept: e.target.value })}>
                {dataset.depts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="City">
              <Select value={form.city} onChange={(e) => set({ city: e.target.value })}>
                {dataset.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Marital Status">
              <Select value={form.marital} onChange={(e) => set({ marital: e.target.value })}>
                {dataset.maritals.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Education">
              <Select value={form.edu} onChange={(e) => set({ edu: e.target.value })}>
                {dataset.edus.map((ed) => (
                  <option key={ed} value={ed}>
                    {ed}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Work Mode" className="col-span-2 sm:col-span-1">
              <Select value={form.workMode} onChange={(e) => set({ workMode: e.target.value })}>
                {dataset.workModes.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="relative overflow-hidden">
            <CardTitle hint="probability of leaving">Risk Score</CardTitle>
            <RiskGauge value={riskPct} tone={band.tone} label={band.label} />
          </Card>

          <Card>
            <CardTitle hint="standardized weight × value">Top Risk Drivers</CardTitle>
            <div className="flex flex-col gap-2.5">
              {result.top.map((c) => {
                const positive = c.contrib > 0;
                const w = (Math.abs(c.contrib) / maxContrib) * 100;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-[46%] flex-shrink-0 truncate text-[12.5px] font-medium text-foreground">
                      {prettyFeature(c.name)}
                    </span>
                    <div className="flex flex-1 items-center">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${w}%`,
                            background: positive ? "var(--color-bad)" : "var(--color-good)",
                          }}
                        />
                      </div>
                      <span
                        className="ml-2 w-11 flex-shrink-0 text-right font-mono text-[11px]"
                        style={{ color: positive ? "var(--color-bad)" : "var(--color-good)" }}
                      >
                        {positive ? "+" : ""}
                        {c.contrib.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
              Red bars push risk up, green bars pull it down. Drivers are ranked by their
              standardized contribution to this specific prediction.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RiskGauge({
  value,
  tone,
  label,
}: {
  value: number;
  tone: "bad" | "warn" | "good";
  label: string;
}) {
  const color =
    tone === "bad" ? "var(--color-bad)" : tone === "warn" ? "var(--color-warn)" : "var(--color-good)";
  const r = 74;
  const circ = Math.PI * r; // half circle
  const offset = circ * (1 - Math.min(value, 100) / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path
          d="M 16 110 A 84 84 0 0 1 184 110"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 16 110 A 84 84 0 0 1 184 110"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="-mt-10 flex flex-col items-center">
        <span className="text-[38px] font-extrabold leading-none" style={{ color }}>
          {value.toFixed(1)}%
        </span>
        <span
          className="mt-2 rounded-full px-3 py-1 text-xs font-bold"
          style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

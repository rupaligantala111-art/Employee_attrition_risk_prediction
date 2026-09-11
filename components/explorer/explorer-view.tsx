"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useData } from "@/components/data-provider";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/page-header";
import { dataQuality } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { Employee } from "@/lib/types";

const PAGE_SIZE = 12;

const COLUMNS: { key: keyof Employee; label: string; mono?: boolean }[] = [
  { key: "id", label: "ID", mono: true },
  { key: "name", label: "Name" },
  { key: "dept", label: "Department" },
  { key: "title", label: "Job Title" },
  { key: "city", label: "City" },
  { key: "age", label: "Age" },
  { key: "salary", label: "Salary", mono: true },
  { key: "tenure", label: "Tenure" },
  { key: "satisfaction", label: "Satisfaction" },
  { key: "overtime", label: "Overtime" },
  { key: "workMode", label: "Work Mode" },
  { key: "attrition", label: "Attrition" },
];

export function ExplorerView() {
  const { dataset } = useData();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("");
  const [attrition, setAttrition] = useState("");
  const [page, setPage] = useState(0);

  const quality = useMemo(() => dataQuality(dataset.records), [dataset.records]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dataset.records.filter((r) => {
      if (dept && r.dept !== dept) return false;
      if (attrition && r.attrition !== attrition) return false;
      if (!q) return true;
      return (
        String(r.name ?? "").toLowerCase().includes(q) ||
        String(r.id ?? "").toLowerCase().includes(q) ||
        String(r.title ?? "").toLowerCase().includes(q) ||
        String(r.city ?? "").toLowerCase().includes(q)
      );
    });
  }, [dataset.records, query, dept, attrition]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const resetPage = () => setPage(0);

  const fmt = (col: keyof Employee, v: string | number | null) => {
    if (v === null || v === undefined || v === "") return "—";
    if (col === "salary") return "₹" + Number(v).toLocaleString();
    return String(v);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Data Explorer"
        subtitle="Browse and search the raw employee dataset powering every dashboard and prediction. Filter, search, and page through all records."
      />

      <div className="mb-4 grid grid-cols-2 gap-3.5 md:grid-cols-5">
        {[
          { lbl: "Total Records", val: quality.n },
          { lbl: "Valid Salary", val: quality.validSalary },
          { lbl: "Valid Age", val: quality.validAge },
          { lbl: "Valid Performance", val: quality.validPerf },
          { lbl: "Labeled Attrition", val: quality.validAttr },
        ].map((s) => (
          <div key={s.lbl} className="rounded-[var(--radius-card)] border border-border bg-panel p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{s.lbl}</p>
            <p className="mt-1.5 text-xl font-extrabold text-foreground">{s.val.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label="Search" className="min-w-[220px] flex-[2]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  resetPage();
                }}
                placeholder="Name, ID, job title, city…"
                className="w-full rounded-[10px] border border-border bg-panel-2 py-2.5 pl-9 pr-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Field>
          <Field label="Department" className="min-w-[150px] flex-1">
            <Select
              value={dept}
              onChange={(e) => {
                setDept(e.target.value);
                resetPage();
              }}
            >
              <option value="">All departments</option>
              {dataset.depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Attrition" className="min-w-[130px] flex-1">
            <Select
              value={attrition}
              onChange={(e) => {
                setAttrition(e.target.value);
                resetPage();
              }}
            >
              <option value="">All</option>
              <option value="Yes">Left (Yes)</option>
              <option value="No">Stayed (No)</option>
            </Select>
          </Field>
        </div>

        <CardTitle hint={`${filtered.length.toLocaleString()} matching records`}>
          Employee Records
        </CardTitle>

        <div className="scroll-thin -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[900px] border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-border text-left">
                {COLUMNS.map((c) => (
                  <th
                    key={String(c.key)}
                    className="whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-muted"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr
                  key={`${r.id}-${i}`}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-primary-soft/60",
                    i % 2 ? "bg-panel-2/50" : "",
                  )}
                >
                  {COLUMNS.map((c) => (
                    <td
                      key={String(c.key)}
                      className={cn(
                        "whitespace-nowrap px-3 py-2.5 text-foreground",
                        c.mono && "font-mono text-[11.5px]",
                      )}
                    >
                      {c.key === "attrition" ? (
                        <AttritionBadge value={r.attrition} />
                      ) : (
                        fmt(c.key, r[c.key])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-muted">
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[12.5px] text-muted">
            Page <b className="text-foreground">{safePage + 1}</b> of {pageCount.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="flex items-center gap-1 rounded-[10px] border border-border bg-panel-2 px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="flex items-center gap-1 rounded-[10px] border border-border bg-panel-2 px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AttritionBadge({ value }: { value: string | null }) {
  if (value !== "Yes" && value !== "No")
    return <span className="text-muted">—</span>;
  const left = value === "Yes";
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={{
        color: left ? "var(--color-bad)" : "var(--color-good)",
        background: left ? "var(--color-bad-soft)" : "var(--color-good-soft)",
      }}
    >
      {left ? "Left" : "Stayed"}
    </span>
  );
}

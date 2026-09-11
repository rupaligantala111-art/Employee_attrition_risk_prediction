"use client";

import { useMemo } from "react";
import { useData } from "@/components/data-provider";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { BarSingle } from "@/components/charts/charts";

const PRETTY: Record<string, string> = {
  age: "Age",
  salary: "Monthly Salary",
  tenure: "Tenure",
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

export function PerformanceView() {
  const { model } = useData();
  const m = model.metrics;

  const metricCards = [
    { lbl: "Accuracy", val: (m.accuracy * 100).toFixed(1) + "%", desc: "Correct predictions overall" },
    { lbl: "Precision", val: (m.precision * 100).toFixed(1) + "%", desc: "Of predicted leavers, how many left" },
    { lbl: "Recall", val: (m.recall * 100).toFixed(1) + "%", desc: "Of actual leavers, how many caught" },
    { lbl: "F1 Score", val: (m.f1 * 100).toFixed(1) + "%", desc: "Harmonic mean of precision & recall" },
  ];

  const weights = useMemo(() => {
    return model.featureNames
      .map((name, i) => ({ name: prettyFeature(name), value: +model.W[i].toFixed(3) }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 12);
  }, [model]);

  const confusion = [
    { label: "True Negatives", sub: "Predicted Stay · Stayed", val: m.tn, tone: "good" },
    { label: "False Positives", sub: "Predicted Leave · Stayed", val: m.fp, tone: "warn" },
    { label: "False Negatives", sub: "Predicted Stay · Left", val: m.fn, tone: "warn" },
    { label: "True Positives", sub: "Predicted Leave · Left", val: m.tp, tone: "good" },
  ] as const;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Model Performance"
        subtitle="Evaluation of the logistic-regression classifier on a held-out 20% test split, plus the learned feature weights that drive every prediction."
      />

      <div className="mb-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {metricCards.map((c, i) => (
          <div
            key={c.lbl}
            className="animate-fade-up rounded-[var(--radius-card)] border border-border bg-gradient-to-br from-primary to-primary-2 p-4 text-white"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{c.lbl}</p>
            <p className="mt-1.5 text-[28px] font-extrabold leading-none">{c.val}</p>
            <p className="mt-2 text-[11px] leading-snug opacity-80">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle hint={`${model.testSize.toLocaleString()} test records`}>
            Confusion Matrix
          </CardTitle>
          <div className="grid grid-cols-2 gap-3">
            {confusion.map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border p-4 text-center"
                style={{
                  background:
                    c.tone === "good" ? "var(--color-good-soft)" : "var(--color-warn-soft)",
                }}
              >
                <p
                  className="text-[26px] font-extrabold leading-none"
                  style={{ color: c.tone === "good" ? "var(--color-good)" : "var(--color-warn)" }}
                >
                  {c.val.toLocaleString()}
                </p>
                <p className="mt-1.5 text-[12px] font-bold text-foreground">{c.label}</p>
                <p className="text-[10.5px] text-muted">{c.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-panel-2 p-2.5">
              <p className="font-bold text-foreground">{model.usableSize.toLocaleString()}</p>
              <p className="text-muted">Labeled records</p>
            </div>
            <div className="rounded-lg bg-panel-2 p-2.5">
              <p className="font-bold text-foreground">{model.trainSize.toLocaleString()}</p>
              <p className="text-muted">Training set</p>
            </div>
            <div className="rounded-lg bg-panel-2 p-2.5">
              <p className="font-bold text-foreground">{model.testSize.toLocaleString()}</p>
              <p className="text-muted">Test set</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle hint="top 12 by magnitude">Feature Weights</CardTitle>
          <BarSingle data={weights} color="#4f46e5" horizontal height={360} />
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle>How the model works</CardTitle>
        <div className="grid grid-cols-1 gap-4 text-[13px] leading-relaxed text-muted sm:grid-cols-3">
          <div>
            <p className="mb-1 font-bold text-foreground">1. Feature engineering</p>
            Numeric fields (age, salary, tenure, training, performance, satisfaction) are
            median-imputed and standardized. Categorical fields are one-hot encoded, plus flags for
            overtime, gender, and missing salary.
          </div>
          <div>
            <p className="mb-1 font-bold text-foreground">2. Training</p>
            A logistic-regression model is trained with batch gradient descent and a small L2
            penalty over a seeded 80/20 split, so results are reproducible on every load.
          </div>
          <div>
            <p className="mb-1 font-bold text-foreground">3. Scoring</p>
            The sigmoid of the weighted sum yields a probability of attrition. Per-feature
            contributions explain each individual prediction on the Prediction page.
          </div>
        </div>
      </Card>
    </div>
  );
}

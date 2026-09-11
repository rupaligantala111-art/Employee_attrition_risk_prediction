"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { parseDataset } from "@/lib/data";
import { trainModel, type TrainedModel } from "@/lib/model";
import type { Dataset, RawData } from "@/lib/types";
import { LoadingScreen } from "./loading-screen";

type DataContextValue = {
  dataset: Dataset;
  model: TrainedModel;
};

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<RawData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/hr-data.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load dataset (${res.status})`);
        return res.json();
      })
      .then((data: RawData) => {
        if (active) setRaw(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  // parse + train once the raw data is available; memoized so navigation
  // between views never retrains the model.
  const value = useMemo<DataContextValue | null>(() => {
    if (!raw) return null;
    const dataset = parseDataset(raw);
    const model = trainModel(dataset);
    return { dataset, model };
  }, [raw]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-lg font-bold text-bad">Could not load dataset</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  if (!value) return <LoadingScreen />;

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

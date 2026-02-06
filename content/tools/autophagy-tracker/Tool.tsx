"use client";

import { useEffect, useMemo, useState } from "react";
import { hybridStorage } from "@/lib/storage/hybrid";

type Stage = {
  label: string;
  atHour: number;
  description: string;
};

const STORAGE_KEY = "autophagy-tracker:last-meal";

const STAGES: Stage[] = [
  {
    label: "Fed / Glycogen",
    atHour: 0,
    description: "Glucose from your last meal powers everything.",
  },
  {
    label: "Glycogen dips",
    atHour: 12,
    description: "Liver glycogen thins; insulin falls.",
  },
  {
    label: "Autophagy onset",
    atHour: 18,
    description: "Cells recycle damaged bits; cleanup begins.",
  },
  {
    label: "Deep recycling",
    atHour: 24,
    description: "Growth hormone rises; autophagy becomes efficient.",
  },
  {
    label: "Fat-first fuel",
    atHour: 36,
    description: "Ketones dominate. Consult a pro if going longer.",
  },
];

function toInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function AutophagyTrackerTool() {
  const [lastMealISO, setLastMealISO] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    hybridStorage.getJSON<string>(STORAGE_KEY).then((value) => {
      if (value) setLastMealISO(value);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated || !lastMealISO) return;
    hybridStorage.setJSON(STORAGE_KEY, lastMealISO);
  }, [lastMealISO, hydrated]);

  const elapsedHours = useMemo(() => {
    if (!lastMealISO) return 0;
    const diff = now - new Date(lastMealISO).getTime();
    return Math.max(0, diff / (1000 * 60 * 60));
  }, [lastMealISO, now]);

  const currentStage = useMemo(() => {
    let stage = STAGES[0];
    for (const checkpoint of STAGES) {
      if (elapsedHours >= checkpoint.atHour) stage = checkpoint;
    }
    return stage;
  }, [elapsedHours]);

  const progress = Math.min(1, elapsedHours / STAGES[STAGES.length - 1].atHour);

  function handleInputChange(value: string) {
    setLastMealISO(value ? new Date(value).toISOString() : null);
  }

  function handleSetNow() {
    const now = new Date();
    handleInputChange(toInputValue(now));
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/70 via-slate-900/70 to-slate-900/90 p-6 shadow-xl shadow-emerald-500/10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
          Tool · Metabolic timeline
        </p>
        <h1 className="text-3xl font-semibold text-white">Autophagy Tracker</h1>
        <p className="text-slate-200">
          Log your last meal and watch the metabolic stages unfold. Data stays
          in the browser via IndexedDB with a localStorage fallback.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-col text-sm text-slate-200">
          Last meal time
          <input
            type="datetime-local"
            value={lastMealISO ? toInputValue(new Date(lastMealISO)) : ""}
            onChange={(event) => handleInputChange(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-emerald-400"
          />
        </label>
        <button
          onClick={handleSetNow}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Set to now
        </button>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-slate-200">
          <span>{elapsedHours.toFixed(1)}h elapsed</span>
          <span>{(progress * 100).toFixed(0)}% of 36h horizon</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-300 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-sm font-semibold text-emerald-100">{currentStage.label}</p>
        <p className="text-sm text-slate-200">{currentStage.description}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
          Stage timeline
        </p>
        <div className="space-y-3">
          {STAGES.map((stage, index) => {
            const nextHour = STAGES[index + 1]?.atHour ?? stage.atHour + 6;
            const segmentStart = stage.atHour;
            const segmentEnd = nextHour;
            const inSegment =
              elapsedHours >= segmentStart && elapsedHours < segmentEnd;
            return (
              <div
                key={stage.label}
                className={`rounded-xl border px-4 py-3 ${
                  inSegment
                    ? "border-emerald-300/60 bg-emerald-900/40 shadow-inner shadow-emerald-500/20"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>{stage.label}</span>
                  <span className="text-xs text-emerald-100">{stage.atHour}h</span>
                </div>
                <p className="text-sm text-slate-200">{stage.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { hybridStorage } from "@/lib/storage/hybrid";

type Entry = {
  id: string;
  amount: number;
  timestamp: string;
};

type PersistedPayload = {
  date: string;
  entries: Entry[];
};

const STORAGE_KEY = "water-tracker:payload";
const DAILY_GOAL_ML = 3000;

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WaterTrackerTool() {
  const [payload, setPayload] = useState<PersistedPayload | null>(null);
  const [inputAmount, setInputAmount] = useState("250");

  useEffect(() => {
    hybridStorage.getJSON<PersistedPayload>(STORAGE_KEY).then((data) => {
      const today = todayStamp();
      if (data && data.date === today) {
        setPayload(data);
      } else {
        setPayload({ date: today, entries: [] });
      }
    });
  }, []);

  useEffect(() => {
    if (!payload) return;
    hybridStorage.setJSON(STORAGE_KEY, payload);
  }, [payload]);

  const entries = useMemo(
    () => payload?.entries ?? [],
    [payload],
  );
  const totalMl = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.amount, 0),
    [entries],
  );
  const progress = Math.min(1, totalMl / DAILY_GOAL_ML);

  function addEntry() {
    const amount = Number(inputAmount);
    if (Number.isNaN(amount) || amount <= 0) return;
    const now = new Date().toISOString();
    const today = todayStamp();
    setPayload((prev) => {
      const base =
        prev && prev.date === today ? prev.entries : ([] as Entry[]);
      return {
        date: today,
        entries: [{ id: `${now}-${base.length}`, amount, timestamp: now }, ...base],
      };
    });
    setInputAmount("250");
  }

  function resetToday() {
    setPayload({ date: todayStamp(), entries: [] });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-gradient-to-br from-sky-900/70 via-slate-900/70 to-slate-900/90 p-6 shadow-xl shadow-sky-500/10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">
          Tool · Hydration
        </p>
        <h1 className="text-3xl font-semibold text-white">Water Tracker</h1>
        <p className="text-slate-200">
          Add intakes, auto-reset every midnight. Stored in IndexedDB with a
          localStorage fallback via the shared hybrid storage layer.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-sm text-slate-200">
          Amount (ml)
          <input
            type="number"
            min={0}
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="mt-1 w-32 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-sky-400"
          />
        </label>
        <button
          onClick={addEntry}
          className="rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-400/40 transition hover:-translate-y-[1px] hover:shadow-sky-300/30"
        >
          Add entry
        </button>
        <button
          onClick={resetToday}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Reset today
        </button>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-slate-200">
          <span>{totalMl} ml logged</span>
          <span>{((progress || 0) * 100).toFixed(0)}% of {DAILY_GOAL_ML} ml</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200">
            Today&apos;s entries
          </p>
          <span className="text-xs text-slate-200">
            Auto-reset after 00:00 local time
          </span>
        </div>
        {entries.length === 0 && (
          <p className="rounded-lg border border-dashed border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Add your first glass to start the log.
          </p>
        )}
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white"
            >
              <span className="font-semibold">{entry.amount} ml</span>
              <span className="text-slate-200">{formatTime(entry.timestamp)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

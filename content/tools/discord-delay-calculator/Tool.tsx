"use client";

import { useMemo, useState } from "react";

type Option = {
  value: string;
  label: string;
  factor: number;
};

type TaskOption = Option & {
  buffer: number;
};

const PROMISE_OPTIONS: Array<{ value: string; label: string; bias: number }> = [
  { value: "10", label: "10 minutes", bias: 0.2 },
  { value: "15", label: "15 minutes (classic)", bias: 0.6 },
  { value: "20", label: "20 minutes", bias: 0.35 },
  { value: "30", label: "30 minutes (classic)", bias: 0.75 },
  { value: "45", label: "45 minutes", bias: 0.55 },
  { value: "60", label: "60 minutes", bias: 0.35 },
  { value: "custom", label: "Custom", bias: 0.4 },
];

const INITIATOR_OPTIONS: Option[] = [
  { value: "he", label: "He prompted the invite", factor: -0.1 },
  { value: "you", label: "You asked him", factor: 0.2 },
  { value: "mutual", label: "Mutual / already hanging", factor: 0.05 },
];

const EAGER_OPTIONS: Option[] = [
  { value: "low", label: "Low", factor: 0.5 },
  { value: "meh", label: "Meh", factor: 0.25 },
  { value: "high", label: "High", factor: -0.1 },
  { value: "locked", label: "Locked in", factor: -0.2 },
];

const TASK_OPTIONS: TaskOption[] = [
  { value: "quick", label: "Quick thing", factor: 0.1, buffer: 5 },
  { value: "errand", label: "Errand", factor: 0.35, buffer: 10 },
  { value: "food", label: "Meal / food run", factor: 0.6, buffer: 15 },
  { value: "unknown", label: "Unknown / vague", factor: 0.45, buffer: 12 },
];

const TRACK_OPTIONS: Option[] = [
  { value: "always", label: "Always late", factor: 0.6 },
  { value: "often", label: "Often late", factor: 0.4 },
  { value: "sometimes", label: "Sometimes late", factor: 0.2 },
  { value: "reliable", label: "Usually on time", factor: -0.1 },
];

function toInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function parseMinutes(value: string) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return 0;
  return Math.round(parsed);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DiscordDelayCalculatorTool() {
  const [promisePreset, setPromisePreset] = useState("15");
  const [customMinutes, setCustomMinutes] = useState("20");
  const [initiator, setInitiator] = useState("he");
  const [eagerness, setEagerness] = useState("meh");
  const [task, setTask] = useState("unknown");
  const [track, setTrack] = useState("often");
  const [anchorMode, setAnchorMode] = useState("now");
  const [anchorTime, setAnchorTime] = useState(() => toInputValue(new Date()));

  const baseMinutes = useMemo(() => {
    if (promisePreset === "custom") return parseMinutes(customMinutes);
    return parseMinutes(promisePreset);
  }, [customMinutes, promisePreset]);

  const promiseBias = useMemo(() => {
    return (
      PROMISE_OPTIONS.find((option) => option.value === promisePreset)?.bias ??
      0.4
    );
  }, [promisePreset]);

  const initiatorFactor =
    INITIATOR_OPTIONS.find((option) => option.value === initiator)?.factor ?? 0;
  const eagerFactor =
    EAGER_OPTIONS.find((option) => option.value === eagerness)?.factor ?? 0;
  const taskFactor =
    TASK_OPTIONS.find((option) => option.value === task)?.factor ?? 0.3;
  const taskBuffer =
    TASK_OPTIONS.find((option) => option.value === task)?.buffer ?? 8;
  const trackFactor =
    TRACK_OPTIONS.find((option) => option.value === track)?.factor ?? 0.3;

  const estimate = useMemo(() => {
    if (!baseMinutes) {
      return {
        minutes: 0,
        min: 0,
        max: 0,
        confidence: "Unknown",
        eta: null as Date | null,
      };
    }

    const factorSum = promiseBias + initiatorFactor + eagerFactor + taskFactor + trackFactor;
    const multiplier = Math.max(1, 1 + factorSum);
    const buffer = Math.round(taskBuffer + baseMinutes * 0.1);
    const minutes = Math.round(baseMinutes * multiplier + buffer);
    const spread = Math.max(5, Math.round(minutes * 0.2));

    let confidence = "Medium";
    if (factorSum >= 0.8) confidence = "Low";
    if (factorSum <= 0.25) confidence = "Higher";

    const anchorDate =
      anchorMode === "now" ? new Date() : new Date(anchorTime);
    const eta = Number.isNaN(anchorDate.getTime())
      ? null
      : new Date(anchorDate.getTime() + minutes * 60_000);

    return {
      minutes,
      min: Math.max(1, minutes - spread),
      max: minutes + spread,
      confidence,
      eta,
    };
  }, [
    anchorMode,
    anchorTime,
    baseMinutes,
    eagerFactor,
    initiatorFactor,
    promiseBias,
    taskBuffer,
    taskFactor,
    trackFactor,
  ]);

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/70 via-slate-900/70 to-slate-900/90 p-6 shadow-xl shadow-indigo-500/10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-200">
          Tool · Timing reality check
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Naeilrium Discord Delay Calculator
        </h1>
        <p className="text-slate-200">
          Playful estimator for when “back in 15” isn’t 15. Tweak the inputs,
          then get an ETA and a reality-adjusted range.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm text-slate-200">
          Promised time
          <select
            value={promisePreset}
            onChange={(event) => setPromisePreset(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400"
          >
            {PROMISE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-200">
          Custom minutes
          <input
            type="number"
            min={1}
            disabled={promisePreset !== "custom"}
            value={customMinutes}
            onChange={(event) => setCustomMinutes(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400 disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-200">
          Who prompted the invite?
          <select
            value={initiator}
            onChange={(event) => setInitiator(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400"
          >
            {INITIATOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-200">
          How eager was he?
          <select
            value={eagerness}
            onChange={(event) => setEagerness(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400"
          >
            {EAGER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-200">
          What was he doing?
          <select
            value={task}
            onChange={(event) => setTask(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400"
          >
            {TASK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-200">
          Track record (Last 5)
          <select
            value={track}
            onChange={(event) => setTrack(event.target.value)}
            className="mt-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400"
          >
            {TRACK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-slate-200">
          Start time
          <div className="mt-1 flex flex-wrap gap-2">
            <select
              value={anchorMode}
              onChange={(event) => setAnchorMode(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400"
            >
              <option value="now">Now</option>
              <option value="custom">Custom</option>
            </select>
            <input
              type="datetime-local"
              value={anchorTime}
              disabled={anchorMode !== "custom"}
              onChange={(event) => setAnchorTime(event.target.value)}
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none transition focus:border-indigo-400 disabled:opacity-60"
            />
          </div>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">
            Estimated wait
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {estimate.minutes ? `${estimate.minutes} min` : "—"}
          </p>
          <p className="text-sm text-slate-200">
            Range: {estimate.min ? `${estimate.min}-${estimate.max} min` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">
            ETA
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {estimate.eta ? formatTime(estimate.eta) : "—"}
          </p>
          <p className="text-sm text-slate-200">
            Confidence: {estimate.confidence}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">
            Reality note
          </p>
          <p className="mt-2 text-sm text-slate-200">
            This is a playful model. It assumes optimistic promises need padding,
            especially on vague errands.
          </p>
        </div>
      </div>
    </div>
  );
}

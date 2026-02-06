"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Entry = {
  id: string;
  label: string;
  text: string;
};

export default function KiraMinimalistMurdersRoom() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intro = useMemo(
    () =>
      "A stripped-down Death Note micro-story. Each click adds a terse log line: who fell, why, and the ripple that broke the city.",
    [],
  );

  async function generate() {
    setLoading(true);
    setError(null);
    const day = new Date().toISOString().slice(0, 10);
    const id = crypto.randomUUID();
    const history = entries
      .filter((entry) => entry.text.trim().length > 0)
      .map((entry) => ({ label: entry.label, text: entry.text }));
    setEntries((prev) => [...prev, { id, label: `Day ${day}`, text: "" }]);
    try {
      const response = await fetch(
        "/api/rooms/kira-minimalist-murders/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history }),
        },
      );
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate entry");
      }
      if (!response.body) {
        throw new Error("Streaming response was empty.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === id ? { ...entry, text: fullText } : entry,
          ),
        );
      }

      const finalText = fullText.trim();
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                text: finalText || "The notebook stays shut. The city still feels watched.",
              }
            : entry,
        ),
      );
    } catch (err) {
      setError((err as Error).message ?? "Unable to generate entry.");
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, text: "Generation failed. Try again." }
            : entry,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 font-mono">
        <Link
          href="/rooms"
          className="w-fit border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] transition hover:border-white hover:text-white"
        >
          Return to hub
        </Link>
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Room · Thought Experiment
          </p>
          <h1 className="text-3xl font-semibold">
            Kira&apos;s Minimalist Murders
            <span className="cursor-blink ml-2 inline-block h-6 w-[2px] bg-white align-[-0.15em]" />
          </h1>
          <p className="text-sm text-white/75">{intro}</p>
        </header>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            disabled={loading}
            className="border border-white px-4 py-2 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Transmitting..." : "Generate Log"}
          </button>
          <span className="text-xs text-white/50">
            Streaming via Vercel AI SDK. Set `OPENAI_API_KEY` in your env.
          </span>
        </div>
        {error && (
          <div className="border border-white/40 px-4 py-3 text-xs text-white">
            {error}
          </div>
        )}
        <ol className="space-y-4">
          {entries.length === 0 && (
            <li className="border border-dashed border-white/30 px-4 py-3 text-xs text-white/60">
              No logs yet. Generate to open the file.
            </li>
          )}
          {entries.map((entry, index) => (
            <li
              key={`${entry.label}-${index}`}
              className="border border-white/20 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                {entry.label}
              </p>
              <p className="mt-2 text-sm text-white">{entry.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

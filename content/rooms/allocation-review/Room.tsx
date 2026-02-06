"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Scenario = {
  id: string;
  title: string;
  summary: string;
  constraints: string[];
  addendum: string[];
  choiceA: { title: string; subtext: string };
  choiceB: { title: string; subtext: string };
};

type LogEntry = {
  id: string;
  timestamp: string;
  scenarioTitle: string;
  contextRequested: boolean;
  choice: "A" | "B";
  consequence: string;
};

const STORAGE_KEY = "afroxhub.room.allocation-review.session";

const consequences = [
  "Subsequent decisions will be made with reduced flexibility.",
  "Future adjustments will carry higher cost.",
  "Time available for review has decreased.",
  "Some parameters have stabilized.",
  "Remaining latitude has narrowed.",
] as const;

function formatTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatLogTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

export default function AllocationReviewRoom() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "choices" | "resolved">("intro");
  const [contextState, setContextState] = useState<"idle" | "revealed">("idle");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [lastConsequence, setLastConsequence] = useState<string | null>(null);
  const [showStamp, setShowStamp] = useState(false);
  const [terminatedAt, setTerminatedAt] = useState<string | null>(null);
  const [closedBanner, setClosedBanner] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [contextRequests, setContextRequests] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [hydrated, setHydrated] = useState(false);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stampTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenarios = useMemo<Scenario[]>(
    () => [
      // Add new scenarios by extending this array with a new object.
      {
        id: "overnight-transit-roster",
        title: "Overnight Transit Roster",
        summary:
          "A defunct transit corridor is being used as a night shelter. The ledger lists 312 sleepers, but the thermal strip count reads 278, and morning transfer orders are already printed.",
        constraints: [
          "Roster totals must reconcile with printed badges by 06:00.",
          "Manual counts require two observers on site.",
          "No new beds can be opened in the corridor.",
          "Auditors require a numeric total, not narrative notes.",
        ],
        addendum: [
          "Several badges are clipped to empty cots; the fabric is still warm.",
          "An internal note asks staff to keep the count below relocation threshold.",
          "Surveillance footage is missing the 02:00 to 03:00 window.",
        ],
        choiceA: {
          title: "Lock the roster to badge count",
          subtext:
            "Keep transfer lists aligned, accepting that some sleepers will not appear on record.",
        },
        choiceB: {
          title: "Recount using thermal strips",
          subtext:
            "Correct the count and accept that badge totals will no longer match the registry.",
        },
      },
      {
        id: "archive-quarantine-seal",
        title: "Archive Quarantine Seal",
        summary:
          "Vault 4B has a mold bloom across appeal files, but hearings are scheduled within ten days and require paper originals.",
        constraints: [
          "Decontamination vendors are not on contract this quarter.",
          "Opening the vault voids the chain-of-custody seal.",
          "Cross-vault contamination triggers a full shutdown.",
          "Hearings cannot be postponed beyond the docket window.",
        ],
        addendum: [
          "Several files are bagged separately with missing labels and wet edges.",
          "A janitor reports a sweet odor and a soft sound when pages are turned.",
          "The cases in 4B are the only ones eligible for reconsideration.",
        ],
        choiceA: {
          title: "Maintain the seal",
          subtext:
            "Protect other vaults, accepting that hearing packets will carry blanks.",
        },
        choiceB: {
          title: "Break the seal for controlled access",
          subtext:
            "Meet the docket and accept contamination risk and later refile loss.",
        },
      },
      {
        id: "proxy-signature-queue",
        title: "Proxy Signature Queue",
        summary:
          "Field kiosks lost biometric verification after a firmware recall. Operators request a one-month proxy signature period to keep intake moving.",
        constraints: [
          "Only one staff witness is available per shift.",
          "Proxy authority expires at month end.",
          "Closure requires public notice with a 14-day lead.",
          "Duplicate signatures trigger an automatic audit.",
        ],
        addendum: [
          "Voice logs show some proxies never speak; the mic captures only breathing.",
          "Several cards issued last week share the same hand pressure pattern.",
          "A proxy badge was found in lost-and-found with the photo removed.",
        ],
        choiceA: {
          title: "Authorize proxy signatures",
          subtext:
            "Keep intake open and accept audit flags and later mismatch cascades.",
        },
        choiceB: {
          title: "Suspend intake until biometrics return",
          subtext:
            "Avoid audit escalation and accept requests moving into unnumbered overflow.",
        },
      },
    ],
    [],
  );

  const scenario = scenarios[scenarioIndex % scenarios.length];
  const complianceStatus = terminatedAt || isClosing ? "CLOSED" : "ACTIVE";
  const statusLine =
    phase === "resolved"
      ? "PARAMETERS LOCKING"
      : contextState === "revealed"
        ? "CONTEXT APPENDED"
        : "PROCESS ACTIVE";

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          sessionId?: string;
          scenarioIndex?: number;
          log?: LogEntry[];
          contextRequests?: number;
          terminatedAt?: string | null;
        };
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        if (typeof parsed.scenarioIndex === "number") {
          setScenarioIndex(parsed.scenarioIndex);
        }
        if (parsed.log) setLog(parsed.log);
        if (typeof parsed.contextRequests === "number") {
          setContextRequests(parsed.contextRequests);
        }
        if (parsed.terminatedAt) {
          setClosedBanner(true);
          setIsClosing(true);
          setTimeout(() => {
            window.localStorage.removeItem(STORAGE_KEY);
            router.push("/rooms");
          }, 9000);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        sessionId,
        scenarioIndex,
        log,
        terminatedAt,
        contextRequests,
      }),
    );
  }, [hydrated, sessionId, scenarioIndex, log, terminatedAt, contextRequests]);

  useEffect(() => {
    if (!sessionId && hydrated) {
      const newId = `AR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      setSessionId(newId);
    }
  }, [hydrated, sessionId]);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
      if (stampTimeout.current) clearTimeout(stampTimeout.current);
    };
  }, []);

  function handleProceed() {
    if (phase !== "intro") return;
    setPhase("choices");
  }

  function handleRequestContext() {
    if (phase !== "intro") return;
    if (contextRequests === 0) {
      setContextRequests((prev) => prev + 1);
      setContextState("revealed");
      setPhase("choices");
      return;
    }
    const roll = Math.floor(Math.random() * 7);
    if (roll === 0) {
      const terminated = new Date().toISOString();
      setTerminatedAt(terminated);
      setPhase("intro");
      advanceTimeout.current = setTimeout(() => {
        router.push("/rooms");
      }, 9000);
      return;
    }
    setContextRequests((prev) => prev + 1);
    setContextState("revealed");
    setPhase("choices");
  }

  function handleDecision(choice: "A" | "B") {
    if (phase !== "choices") return;
    const consequence =
      consequences[Math.floor(Math.random() * consequences.length)];
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: formatLogTimestamp(new Date()),
      scenarioTitle: scenario.title,
      contextRequested: contextState === "revealed",
      choice,
      consequence,
    };

    setLog((prev) => [...prev, entry]);
    setLastConsequence(consequence);
    setPhase("resolved");
    setShowStamp(true);
    stampTimeout.current = setTimeout(() => setShowStamp(false), 700);
    advanceTimeout.current = setTimeout(() => {
      setScenarioIndex((prev) => (prev + 1) % scenarios.length);
      setPhase("intro");
      setContextState("idle");
      setLastConsequence(null);
    }, 1200);
  }

  if (terminatedAt) {
    return (
      <div className="gov-room min-h-screen bg-[#e9e7e2] text-[#1a1a1a]">
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-[#5b5b5b]">
            Process Notice
          </p>
          <p className="max-w-md text-lg font-medium">
            Some decisions are difficult because they cannot be completed.
          </p>
          <p className="max-w-md text-sm text-[#3f3f3f]">
            You requested further clarification.
          </p>
          <p className="max-w-md text-sm text-[#3f3f3f]">
            The process continued with what was already present.
          </p>
          <p className="max-w-md text-sm text-[#3f3f3f]">
            This is where your involvement ends.
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-[#7a7a7a]">
            Returning to hub...
          </p>
        </div>
        <style jsx>{`
          .gov-room {
            font-family: "Public Sans", "News Gothic", "Gill Sans",
              "Trebuchet MS", sans-serif;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gov-room min-h-screen bg-[#e9e7e2] text-[#1a1a1a]">
      <div className="min-h-screen bg-[linear-gradient(to_right,rgba(20,20,20,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(20,20,20,0.08)_1px,transparent_1px)] bg-[size:48px_48px]">
        <HeaderBar
          sessionId={sessionId}
          timestamp={formatTimestamp(now)}
          complianceStatus={complianceStatus}
        />
        {closedBanner && (
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 text-xs uppercase tracking-[0.25em] text-[#4a4a4a]">
            Session closed. Returning to hub.
          </div>
        )}
        <main className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-20 pt-8 lg:grid-cols-[1.4fr_0.9fr]">
          <section className="rounded-sm border border-[#c9c6bf] bg-[#f4f2ee] p-6 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]">
          <ScenarioPanel
              scenario={scenario}
              phase={phase}
              contextState={contextState}
              isClosing={isClosing}
              onProceed={handleProceed}
              onRequestContext={handleRequestContext}
              onDecision={handleDecision}
              lastConsequence={lastConsequence}
              showStamp={showStamp}
            />
          </section>
          <aside className="rounded-sm border border-[#c9c6bf] bg-[#f7f6f2] p-4">
            <RecordLog entries={log} />
          </aside>
        </main>
        <StatusStrip status={statusLine} queueCount={log.length} />
      </div>
      <style jsx>{`
        .gov-room {
          font-family: "Public Sans", "News Gothic", "Gill Sans",
            "Trebuchet MS", sans-serif;
        }
        .fade-slow {
          animation: fade-in 650ms ease both;
        }
        .fade-fast {
          animation: fade-in 320ms ease both;
        }
        .stamp-pop {
          animation: stamp-in 480ms ease-out both;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes stamp-in {
          0% {
            opacity: 0;
            transform: scale(1.1) rotate(-4deg);
          }
          40% {
            opacity: 1;
            transform: scale(1) rotate(-4deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.98) rotate(-4deg);
          }
        }
      `}</style>
    </div>
  );
}

function HeaderBar({
  sessionId,
  timestamp,
  complianceStatus,
}: {
  sessionId: string;
  timestamp: string;
  complianceStatus: string;
}) {
  return (
    <header className="border-b border-[#c2bfb8] bg-[#f2f0ec]">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-[#646464]">
            Civic Operations Portal
          </p>
          <h1 className="text-xl font-semibold tracking-[0.15em] text-[#232323]">
            Allocation Review / Threshold Adjustment
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-[#555555]">
          <Link
            href="/rooms"
            className="border border-[#bdb9b1] px-3 py-2 text-[10px] tracking-[0.3em] text-[#4d4d4d] transition hover:bg-[#dedbd4]"
          >
            Back to hub
          </Link>
          <div className="flex flex-col gap-1 text-[10px]">
            <span>Session ID</span>
            <span className="font-semibold text-[#2e2e2e]">
              {sessionId || "PENDING"}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-[10px]">
            <span>Timestamp</span>
            <span className="font-semibold text-[#2e2e2e]">{timestamp}</span>
          </div>
          <div className="flex flex-col gap-1 text-[10px]">
            <span>Compliance Status</span>
            <span className="font-semibold text-[#2e2e2e]">
              {complianceStatus}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ScenarioPanel({
  scenario,
  phase,
  contextState,
  isClosing,
  onProceed,
  onRequestContext,
  onDecision,
  lastConsequence,
  showStamp,
}: {
  scenario: Scenario;
  phase: "intro" | "choices" | "resolved";
  contextState: "idle" | "revealed";
  isClosing: boolean;
  onProceed: () => void;
  onRequestContext: () => void;
  onDecision: (choice: "A" | "B") => void;
  lastConsequence: string | null;
  showStamp: boolean;
}) {
  return (
    <div className="relative space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6b6b6b]">
            Case File
          </p>
          <h2 className="text-2xl font-semibold tracking-[0.08em]">
            {scenario.title}
          </h2>
          <p className="max-w-xl text-sm text-[#3f3f3f]">
            {scenario.summary}
          </p>
        </div>
        <div className="rounded border border-[#bdb9b1] bg-[#ebe9e4] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[#5a5a5a]">
          File Status: Active Review
        </div>
      </div>

      <div className="border border-dashed border-[#bfbcb4] bg-[#f8f7f4] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.25em] text-[#6a6a6a]">
          Constraints
        </p>
        <ul className="mt-2 space-y-2 text-sm text-[#3d3d3d]">
          {scenario.constraints.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>

      {contextState === "revealed" && (
        <div className="fade-slow border border-[#bfbcb4] bg-[#efece6] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[#6a6a6a]">
            Context Addendum
          </p>
          <ul className="mt-2 space-y-2 text-sm text-[#3b3b3b]">
            {scenario.addendum.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {isClosing && (
        <div className="rounded border border-[#bfbcb4] bg-[#f1efe9] px-4 py-3 text-sm text-[#3d3d3d]">
          Session closed. Returning to hub.
        </div>
      )}

      {phase === "intro" && !isClosing && (
        <div className="flex flex-wrap gap-3">
          <ChoiceButton
            label="Proceed with a decision"
            onClick={onProceed}
          />
          <ChoiceButton
            label="Request additional context"
            variant="outline"
            onClick={onRequestContext}
          />
        </div>
      )}

      {phase === "choices" && !isClosing && (
        <div className="grid gap-4 md:grid-cols-2">
          <ChoiceButton
            label={scenario.choiceA.title}
            subtext={scenario.choiceA.subtext}
            onClick={() => onDecision("A")}
          />
          <ChoiceButton
            label={scenario.choiceB.title}
            subtext={scenario.choiceB.subtext}
            onClick={() => onDecision("B")}
          />
        </div>
      )}

      {phase === "resolved" && (
        <div className="space-y-3">
          <div className="rounded border border-[#bfbcb4] bg-[#f1efe9] px-4 py-3 text-sm text-[#3d3d3d]">
            Decision recorded. Proceeding to the next file.
          </div>
          {lastConsequence && (
            <div className="fade-fast text-sm text-[#444444]">
              {lastConsequence}
            </div>
          )}
        </div>
      )}

      {showStamp && (
        <div className="pointer-events-none absolute right-6 top-6 stamp-pop border border-[#7a1d1d] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#7a1d1d]">
          Recorded
        </div>
      )}
    </div>
  );
}

function RecordLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#6b6b6b]">
          Record / Log
        </p>
        <p className="text-sm text-[#3f3f3f]">
          Append-only review trail. No outcome statements recorded.
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-auto pr-1">
        {entries.length === 0 && (
          <div className="border border-dashed border-[#c7c3bb] bg-[#f3f1ec] px-3 py-3 text-xs text-[#6b6b6b]">
            No recorded actions yet.
          </div>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border border-[#c7c3bb] bg-[#f8f6f1] px-3 py-3 text-xs text-[#404040]"
          >
            <p className="uppercase tracking-[0.2em] text-[#6a6a6a]">
              {entry.timestamp} · {entry.scenarioTitle}
            </p>
            <p className="mt-2">
              Context requested: {entry.contextRequested ? "Yes" : "No"}
            </p>
            <p>Decision: Option {entry.choice}</p>
            <p>Consequence: {entry.consequence}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusStrip({
  status,
  queueCount,
}: {
  status: string;
  queueCount: number;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-[#c2bfb8] bg-[#f2f0ec]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#5c5c5c]">
        <span key={status} className="fade-fast">
          {status}
        </span>
        <span>Decisions logged: {queueCount}</span>
      </div>
    </footer>
  );
}

function ChoiceButton({
  label,
  subtext,
  variant = "solid",
  onClick,
}: {
  label: string;
  subtext?: string;
  variant?: "solid" | "outline";
  onClick: () => void;
}) {
  const base =
    "flex w-full flex-col items-start gap-2 rounded-sm border px-4 py-3 text-left text-sm uppercase tracking-[0.15em] transition";
  const solid =
    "border-[#8f8b84] bg-[#e3e1dc] text-[#2a2a2a] hover:bg-[#dad6cf]";
  const outline =
    "border-[#b7b2aa] bg-transparent text-[#4b4b4b] hover:bg-[#ebe7e0]";

  return (
    <button
      onClick={onClick}
      className={`${base} ${variant === "solid" ? solid : outline}`}
    >
      <span className="text-xs uppercase tracking-[0.3em] text-[#6a6a6a]">
        {label}
      </span>
      {subtext && (
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#4d4d4d]">
          {subtext}
        </span>
      )}
    </button>
  );
}

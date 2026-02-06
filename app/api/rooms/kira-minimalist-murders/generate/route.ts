import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { rateLimit, withRateLimitHeaders } from "@/lib/rate-limit";

const DEFAULT_MODEL = "gpt-4o-mini";
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60_000;

export async function POST(request: Request) {
  const limit = rateLimit(request, {
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!limit.ok) {
    return withRateLimitHeaders(
      NextResponse.json(
        { error: "Rate limit exceeded. Try again soon." },
        { status: 429 },
      ),
      limit,
      RATE_LIMIT_MAX,
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return withRateLimitHeaders(
      NextResponse.json(
        { error: "Missing OPENAI_API_KEY environment variable." },
        { status: 500 },
      ),
      limit,
      RATE_LIMIT_MAX,
    );
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const body = await request.json().catch(() => null);
  const history =
    body?.history && Array.isArray(body.history)
      ? body.history
          .map((entry: { label?: string; text?: string }) => ({
            label: typeof entry.label === "string" ? entry.label : "Day",
            text: typeof entry.text === "string" ? entry.text.trim() : "",
          }))
          .filter((entry: { text: string }) => entry.text.length > 0)
      : [];
  const historyText =
    history.length > 0
      ? `Previous logs (do not repeat their specifics):\n${history
          .map((entry: { label: string; text: string }) => {
            return `- ${entry.label}: ${entry.text}`;
          })
          .join("\n")}\n`
      : "";

  const result = streamText({
    model: openai(model),
    system:
      "You write terse alternate-timeline log entries. Try to achieve a subtle humour through sarcasm. Each alternate-timeline day log will be a mockery to the original TV show, and how gullible that Kira character is.",
    prompt:
      `${historyText}Write 1-2 sentences about a Death Note timeline where Kira is not an arrogant prick, and makes no obvious and stupid mistakes. And remains undetected by simply not challenging anyone. He still continues his life though. School and chores. And careful killings in between, all of which wont harm his anonymity. Avoid modern pop-culture references. Avoid opening with 'In this timeline'. Output a single paragraph only.`,
    temperature: 0.6,
    maxOutputTokens: 120,
  });

  const response = result.toTextStreamResponse();
  response.headers.set("x-ratelimit-limit", String(RATE_LIMIT_MAX));
  response.headers.set("x-ratelimit-remaining", String(limit.remaining));
  response.headers.set(
    "x-ratelimit-reset",
    String(Math.ceil(limit.resetAt / 1000)),
  );
  return response;
}

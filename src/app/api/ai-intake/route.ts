import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/lib/types";

/**
 * Provider-agnostic: any OpenAI-compatible chat-completions endpoint works.
 * Defaults to Gemini's free tier via its OpenAI compatibility layer —
 * set LLM_BASE_URL/LLM_MODEL to switch providers.
 */
const BASE_URL =
  process.env.LLM_BASE_URL ??
  "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = process.env.LLM_MODEL ?? "gemini-3.6-flash";

const INTAKE_PROMPT = `You are the intake assistant for a freelance forex software developer.
Your job is to help a trader turn a vague idea into a specification the developer can quote and build.

Ask ONE focused question at a time. Work through, in roughly this order:
- Platform and language (MT4/MQL4, MT5/MQL5, or TradingView/Pine Script)
- Instruments and timeframes
- Entry rules — be specific about indicators, sessions, and confirmation
- Exit rules — take profit, stop loss, trailing, break-even
- Risk management — lot sizing, max daily loss, max open trades, prop-firm rules
- Anything else that must be configurable as an input

Keep replies under 120 words. Use plain language; the client may not be technical.
If the client is vague, offer two or three concrete options rather than asking them to guess.

Write in plain text only. Do not use markdown — no asterisks for bold or italics, no
hashes for headings, no backticks. The chat window renders exactly what you send.

Never promise profitability, win rates, or returns. If asked whether a strategy will make money,
say plainly that you cannot know that and that the developer builds what the client specifies.
Do not give trading or investment advice.`;

const SUMMARY_PROMPT = `Summarise the conversation into a build specification using exactly these headings:

PLATFORM
INSTRUMENTS & TIMEFRAMES
ENTRY RULES
EXIT RULES
RISK MANAGEMENT
CONFIGURABLE INPUTS
OPEN QUESTIONS

Use short bullet points. Under OPEN QUESTIONS list anything the client has not yet decided —
do not invent answers or fill gaps with assumptions. Output plain text, no markdown formatting.`;

export async function POST(request: Request) {
  // Auth gate: an open endpoint here would let anyone spend the API budget.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The AI assistant is not configured yet. Set LLM_API_KEY." },
      { status: 503 },
    );
  }

  let body: { messages?: ChatMessage[]; summarize?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-24)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));

  if (history.length === 0) {
    return NextResponse.json({ error: "Nothing to send" }, { status: 400 });
  }

  const messages = body.summarize
    ? [
        { role: "system" as const, content: SUMMARY_PROMPT },
        ...history,
        { role: "user" as const, content: "Produce the specification now." },
      ]
    : [{ role: "system" as const, content: INTAKE_PROMPT }, ...history];

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: body.summarize ? 0.2 : 0.6,
        // Gemini 3.x reasons before answering and that reasoning is charged
        // against max_tokens, so this budget has to cover thinking as well as
        // the visible reply. Set too low, the model returns empty content.
        // The prompts keep the actual output short.
        max_tokens: body.summarize ? 4000 : 2000,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("LLM error", res.status, detail.slice(0, 500));
      return NextResponse.json(
        { error: "The assistant is unavailable right now. Try again shortly." },
        { status: 502 },
      );
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    const reply = choice?.message?.content?.trim();

    if (!reply) {
      // Almost always means the token budget ran out during reasoning.
      const reason = choice?.finish_reason;
      console.error("LLM returned no content", { reason, usage: data?.usage });
      return NextResponse.json(
        {
          error:
            reason === "length"
              ? "That answer got too long. Try asking something more specific."
              : "The assistant returned an empty reply. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("LLM request failed", err);
    return NextResponse.json(
      { error: "Could not reach the assistant." },
      { status: 502 },
    );
  }
}

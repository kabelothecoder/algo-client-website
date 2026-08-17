/**
 * Checks that the AI assistant key in .env.local actually works.
 *   npm run check:ai
 *
 * Reads the key from the file, sends one tiny test message, and prints whether
 * it worked. Never prints the key itself.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const envPath = join(process.cwd(), ".env.local");

let raw;
try {
  raw = readFileSync(envPath, "utf8");
} catch {
  console.error("\n  ✖  Could not find .env.local in", process.cwd());
  console.error("     Copy .env.local.example to .env.local first.\n");
  process.exit(1);
}

const env = {};
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const key = env.LLM_API_KEY;
const baseUrl =
  env.LLM_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
const model = env.LLM_MODEL || "gemini-2.5-flash";

if (!key) {
  console.error("\n  ✖  LLM_API_KEY is empty in .env.local");
  console.error("     Get a free key at https://aistudio.google.com/apikey");
  console.error("     then put it after the = sign, with no spaces or quotes.\n");
  process.exit(1);
}

console.log(`\n  Testing ${model}`);
console.log(`  Key found: ${key.slice(0, 6)}…${key.slice(-4)} (${key.length} chars)\n`);

try {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with the single word: working" }],
      // Gemini 3.x charges its internal reasoning against max_tokens, so a
      // tight budget here returns empty content and looks like a broken key.
      max_tokens: 800,
    }),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(`  ✖  The API rejected it (HTTP ${res.status}).\n`);
    if (res.status === 401 || res.status === 403) {
      console.error("     That usually means the key is wrong or was copied");
      console.error("     with a space. Try copying it again.\n");
    } else if (res.status === 429) {
      console.error("     Rate limited — the key works, you have just used");
      console.error("     up the free quota for now. Try again later.\n");
    } else if (res.status === 404) {
      console.error(`     Model "${model}" was not found. Check LLM_MODEL.\n`);
    }
    console.error("     Raw response:", body.slice(0, 300), "\n");
    process.exit(1);
  }

  const data = JSON.parse(body);
  const reply = data?.choices?.[0]?.message?.content?.trim();
  console.log(`  ✔  It works. The assistant replied: "${reply}"\n`);
  console.log("     Your AI intake chat is live. Restart the dev server if");
  console.log("     it was already running.\n");
} catch (err) {
  console.error("  ✖  Could not reach the API.");
  console.error("     Check your internet connection.\n");
  console.error("    ", err.message, "\n");
  process.exit(1);
}

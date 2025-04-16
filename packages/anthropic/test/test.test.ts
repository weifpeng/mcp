import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { test } from "vitest";

test("test", { timeout: 10000 }, async () => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_API_URL,
  });

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude" }],
    stream: true,
  });

  console.log(message);
});

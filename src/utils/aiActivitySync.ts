import { z } from "zod";

const countSchema = z.number().int().min(0).max(1_000_000);
const providerSchema = z.object({
  sessions: countSchema,
  toolCalls: countSchema,
});
const aiActivitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  providers: z.object({
    codex: providerSchema,
    claude: providerSchema,
  }),
  tools: z.object({
    terminal: countSchema,
    files: countSchema,
    web: countSchema,
    browser: countSchema,
    other: countSchema,
  }),
  history: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        sessions: countSchema,
        toolCalls: countSchema,
      }),
    )
    .max(100),
});

export function parseAiActivity(value: unknown) {
  return aiActivitySchema.safeParse(value);
}

import { z } from "zod";

const countSchema = z.number().int().min(0).max(1_000_000);
const providerSchema = z.object({
  sessions: countSchema,
  toolCalls: countSchema,
});
const sessionSchema = z.object({
  id: z.string().min(1).max(160),
  provider: z.enum(["codex", "claude"]),
  title: z.string().min(1).max(160),
  startedAt: z.string().datetime(),
  toolCalls: countSchema,
  tools: z.object({
    terminal: countSchema,
    files: countSchema,
    web: countSchema,
    browser: countSchema,
    other: countSchema,
  }),
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
  sessions: z.array(sessionSchema).max(500).optional(),
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

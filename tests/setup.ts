import { vi } from "vitest";

vi.mock("@sentry/astro", () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

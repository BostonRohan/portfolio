import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { assistantIntro, suggestedPrompts } from "../../data/portfolio.js";

type ChatAction = "scroll" | "navigate" | "highlight" | "none";

interface AssistantResponse {
  message: string;
  action: ChatAction;
  target?: string;
  suggestions?: string[];
}

interface Message {
  role: "assistant" | "user";
  content: string;
  action?: ChatAction;
  target?: string;
}

const SECTION_ID_MAP: Record<string, string> = {
  home: "home",
  projects: "projects",
  experience: "experience",
  blog: "blog",
  contact: "contact",
};

const NAV_TARGET_MAP: Record<string, string> = {
  home: "/",
  projects: "/#projects",
  experience: "/#experience",
  blog: "/#blog",
  contact: "/#contact",
};

const HIGHLIGHT_DURATION_MS = 1700;

function dispatchAction(action: ChatAction, target?: string) {
  if (!target || action === "none") return;

  if (action === "navigate") {
    const href = NAV_TARGET_MAP[target];
    if (href) {
      window.location.assign(href);
    }
    return;
  }

  const sectionId = SECTION_ID_MAP[target];
  if (!sectionId) return;

  const section = document.getElementById(sectionId);
  if (!section) return;

  if (action === "scroll" || action === "highlight") {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (action === "highlight") {
    section.classList.add("ai-highlight");
    window.setTimeout(() => {
      section.classList.remove("ai-highlight");
    }, HIGHLIGHT_DURATION_MS);
  }
}

export default function PortfolioAssistant({ imageUrl }: { imageUrl?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: assistantIntro,
      action: "none",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = useMemo(() => suggestedPrompts, []);

  async function submitPrompt(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || isLoading) return;

    const nextUserMessage: Message = { role: "user", content: message };
    const nextHistory = [...messages, nextUserMessage];

    setMessages(nextHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: nextHistory.map((entry) => ({
            role: entry.role,
            content: entry.content,
          })),
        }),
      });

      const json: AssistantResponse = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: json.message,
        action: json.action,
        target: json.target,
      };

      setMessages((current) => [...current, assistantMessage]);
      dispatchAction(json.action, json.target);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I hit a connection issue while answering. Ask again in a moment or jump to the sections below.",
          action: "none",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitPrompt(input);
  }

  return (
    <section
      className="rounded-2xl border border-slate-300/70 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 backdrop-blur p-4 sm:p-6 space-y-4 h-[calc(100svh-8rem)] overflow-hidden flex flex-col"
      aria-label="Portfolio assistant"
      id="assistant"
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
          Portfolio Assistant
        </p>
        <div className="flex items-center gap-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Boston Rohan"
              width={88}
              height={88}
              className="rounded-full w-16 h-16 sm:w-[88px] sm:h-[88px] object-cover border border-slate-300 dark:border-zinc-700"
            />
          )}
          <h1 className="text-3xl sm:text-5xl font-bold dark:text-neutral-50">
            Boston Rohan
          </h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1" aria-live="polite">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`rounded-xl px-3 py-2 text-sm sm:text-base ${
              message.role === "assistant"
                ? "bg-slate-100 dark:bg-zinc-800"
                : "bg-slate-900 text-white dark:bg-neutral-100 dark:text-zinc-900 ml-auto"
            } ${message.role === "user" ? "max-w-[85%]" : "max-w-full"}`}
          >
            <p>{message.content}</p>
          </article>
        ))}

        {isLoading && (
          <article className="rounded-xl px-3 py-2 text-sm sm:text-base bg-slate-100 dark:bg-zinc-800 max-w-full">
            <p>Thinking...</p>
          </article>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-slate-300 dark:border-zinc-700 px-3 py-1 text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            onClick={() => submitPrompt(prompt)}
            disabled={isLoading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 sm:p-3 text-sm sm:text-base"
          placeholder="Ask me something about Boston..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium bg-slate-900 text-white hover:bg-slate-700 dark:bg-neutral-100 dark:text-zinc-900 dark:hover:bg-neutral-300 disabled:opacity-60"
        >
          Send
        </button>
      </form>
      <div className="pt-1">
        <a
          href="#projects"
          className="text-xs sm:text-sm underline underline-offset-2 opacity-80 hover:opacity-100 transition"
        >
          Jump to portfolio content
        </a>
      </div>
    </section>
  );
}

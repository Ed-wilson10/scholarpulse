"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { postChat } from "@/lib/api";
import type { ChatMatch, ChatResponse } from "@/lib/types";

type Msg = {
  role: "bot" | "user";
  text: string;
  matches?: ChatMatch[];
  suggestions?: string[];
};

const WELCOME: Msg = {
  role: "bot",
  text:
    "Hi, I'm Pulse — the ScholarPulse assistant. I can help with **scholarship types**, **documents you need**, **deadlines** and **eligibility** for university students in Ghana. What are you looking for?",
  suggestions: [
    "What scholarships are open for masters?",
    "What documents do I need for DAAD?",
    "Show upcoming deadlines",
    "Any opportunities for level 300 students?",
  ],
};

/** Minimal safe markdown: escape HTML, then bold + line breaks. */
function renderText(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return { __html: html };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ question?: string }>).detail;
      setOpen(true);
      setPulse(false);
      if (detail?.question) send(detail.question);
    }
    window.addEventListener("sp-ask", handler);
    return () => window.removeEventListener("sp-ask", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);
    try {
      const data: ChatResponse = await postChat(text);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: data.answer,
          matches: data.matches,
          suggestions: data.suggestions,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "I can't reach the scholarship database right now. Please try again in a moment.",
        },
      ]);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen((v) => !v);
          setPulse(false);
        }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full bg-[var(--cobalt)] px-4 py-3.5 text-white shadow-[0_16px_40px_rgba(35,80,255,0.42)] transition hover:scale-[1.03]"
        aria-label={open ? "Close scholarship assistant" : "Open scholarship assistant"}
      >
        <span className="relative grid h-6 w-6 place-items-center">
          <span className="text-[19px] leading-none">{open ? "×" : "💬"}</span>
          {!open && pulse && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-ping rounded-full bg-[var(--amber)]" />
          )}
        </span>
        <span className="hidden text-[13px] font-extrabold sm:block">
          {open ? "Close" : "Ask about scholarships"}
        </span>
      </button>

      {open && (
        <section className="fixed bottom-[86px] right-3 z-50 flex max-h-[min(620px,80vh)] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-[0_30px_80px_rgba(11,18,32,0.28)] sm:right-5 sm:w-[400px]">
          <header className="flex items-center gap-3 bg-[#0b1220] px-4 py-3.5 text-white">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[var(--cobalt)] text-sm font-black">
              P
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b1220] bg-[var(--mint)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-extrabold leading-tight">Pulse — scholarship assistant</p>
              <p className="text-[11px] text-white/55">Answers about scholarships only</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-lg leading-none text-white/60 hover:text-white"
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div ref={scrollRef} className="chat-scroll flex-1 space-y-3.5 overflow-y-auto bg-[var(--cream)] px-3.5 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[92%]">
                  <div
                    className={
                      m.role === "user"
                        ? "rounded-2xl rounded-br-md bg-[var(--cobalt)] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                        : "rounded-2xl rounded-bl-md border border-[var(--line)] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--ink)]"
                    }
                    dangerouslySetInnerHTML={renderText(m.text)}
                  />

                  {!!m.matches?.length && (
                    <div className="mt-2 space-y-1.5">
                      {m.matches.slice(0, 4).map((match) => (
                        <Link
                          key={match.slug}
                          href={`/opportunities/${match.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-[12px] transition hover:border-[var(--cobalt)]"
                        >
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#E8EDFF] text-[var(--cobalt)]">
                            🎓
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold">{match.title}</span>
                            <span className="block truncate text-[10.5px] text-[var(--ink-soft)]">
                              {match.provider}
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] font-bold text-[var(--coral)]">
                            {match.days_left !== null && match.days_left >= 0
                              ? `${match.days_left}d`
                              : "›"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {m.role === "bot" && i === messages.length - 1 && !!m.suggestions?.length && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="rounded-full border border-[var(--cobalt)]/25 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--cobalt)] transition hover:bg-[#E8EDFF]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--line)] bg-white px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cobalt)] [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cobalt)] [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cobalt)]" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-[var(--line)] bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about documents, deadlines, eligibility…"
                className="max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3 py-2.5 text-[13px] outline-none focus:border-[var(--cobalt)]"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--cobalt)] text-white transition hover:brightness-110 disabled:opacity-40"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-[var(--ink-soft)]/70">
              Scholarships only. Always verify on the official provider page.
            </p>
          </form>
        </section>
      )}
    </>
  );
}

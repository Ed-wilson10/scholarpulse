"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { subscribe } from "@/lib/api";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      return;
    }
    setState("loading");
    const ok = await subscribe(email);
    setState(ok ? "done" : "error");
    if (ok) setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setState("idle");
          }}
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-[var(--amber)]"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-full bg-[var(--amber)] px-4 py-2.5 text-[12.5px] font-black text-[#0b1220] transition hover:brightness-105 disabled:opacity-60"
        >
          {state === "loading" ? "..." : "Join"}
        </button>
      </div>
      {state === "done" && <p className="mt-2 text-xs text-[var(--mint)]">You&apos;re on the list.</p>}
      {state === "error" && <p className="mt-2 text-xs text-[var(--coral)]">Enter a valid email address.</p>}
    </form>
  );
}

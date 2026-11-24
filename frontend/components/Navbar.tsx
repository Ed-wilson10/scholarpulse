"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearTokens, fetchMe, getToken } from "@/lib/api";
import type { User } from "@/lib/types";

const links = [
  { href: "/opportunities", label: "All opportunities" },
  { href: "/opportunities?kind=scholarship", label: "Scholarships" },
  { href: "/opportunities?kind=exchange", label: "Exchange" },
  { href: "/opportunities?kind=tech", label: "Tech training" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (!getToken()) {
        setUser(null);
        return;
      }
      fetchMe()
        .then((data) => alive && setUser(data))
        .catch(() => alive && setUser(null));
    };
    load();
    window.addEventListener("sp-auth", load);
    return () => {
      alive = false;
      window.removeEventListener("sp-auth", load);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(255,248,239,0.88)] backdrop-blur-xl">
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-[var(--cobalt)] text-white shadow-lg shadow-blue-600/25">
            <span className="text-lg font-black">S</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[var(--cream)] bg-[var(--coral)]" />
          </span>
          <span className="text-[19px] font-black tracking-tight">
            Scholar<span className="text-[var(--cobalt)]">Pulse</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-[var(--ink-soft)] transition hover:bg-white hover:text-[var(--ink)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <>
              {user.is_staff && (
                <Link href="/admin" className="btn btn-ghost !px-4 !py-2.5 !text-[13px]">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-ghost !px-4 !py-2.5 !text-[13px]">
                {user.first_name || "My"} dashboard
              </Link>
              <button
                className="rounded-full px-3 py-2 text-[13px] font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
                onClick={() => {
                  clearTokens();
                  setUser(null);
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !px-4 !py-2.5 !text-[13px]">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary !px-5 !py-2.5 !text-[13px]">
                Create free account
              </Link>
            </>
          )}
        </div>

        <button
          aria-label="Menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-xl leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="container-x pb-5 lg:hidden">
          <div className="card flex flex-col gap-1 p-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--cream)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-[var(--line)] pt-3">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn-ghost flex-1 !py-2.5 !text-[13px]">
                    Dashboard
                  </Link>
                  {user.is_staff && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="btn btn-primary flex-1 !py-2.5 !text-[13px]">
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn btn-ghost flex-1 !py-2.5 !text-[13px]">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn btn-primary flex-1 !py-2.5 !text-[13px]">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

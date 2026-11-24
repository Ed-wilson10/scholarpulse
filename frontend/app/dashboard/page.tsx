"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_URL, fetchMe, fetchOpportunities, getToken } from "@/lib/api";
import OpportunityCard from "@/components/OpportunityCard";
import type { Opportunity, User } from "@/lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [ops, setOps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!getToken()) {
        setLoggedOut(true);
        setLoading(false);
        return;
      }
      try {
        const [me, list] = await Promise.all([fetchMe(), fetchOpportunities("", API_URL)]);
        if (!alive) return;
        setUser(me);
        setOps(list);
      } catch {
        if (alive) setLoggedOut(true);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const saved = useMemo(() => {
    if (!user?.saved) return [];
    return ops.filter((o) => user.saved.includes(o.slug));
  }, [ops, user]);

  const level = user?.profile?.level || "400";
  const recommended = useMemo(
    () =>
      ops
        .filter((o) => o.is_open && (o.levels || []).includes(level) && !user?.saved?.includes(o.slug))
        .slice(0, 3),
    [ops, level, user]
  );

  const closing = useMemo(
    () =>
      ops
        .filter((o) => o.is_open && (o.days_left ?? 999) <= 21)
        .sort((a, b) => (a.days_left ?? 999) - (b.days_left ?? 999))
        .slice(0, 5),
    [ops]
  );

  if (loading) {
    return (
      <div className="container-x py-16">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-black/10" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-3xl bg-black/5" />
          ))}
        </div>
        <div className="mt-8 h-64 animate-pulse rounded-3xl bg-black/5" />
      </div>
    );
  }

  if (loggedOut || !user) {
    return (
      <div className="container-x py-20">
        <div className="card mx-auto max-w-md p-10 text-center">
          <p className="text-4xl">🔐</p>
          <h1 className="mt-4 text-2xl font-black">Log in to see your dashboard</h1>
          <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">
            Your saved opportunities and deadline watchlist live behind a free account.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/login?next=/dashboard" className="btn btn-primary">Log in</Link>
            <Link href="/register" className="btn btn-ghost">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  const firstName = user.first_name || user.email.split("@")[0];
  const soonCount = ops.filter((o) => o.is_open && (o.days_left ?? 999) <= 14).length;

  return (
    <div className="container-x py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--cobalt)]">
            Your dashboard
          </p>
          <h1 className="mt-2 text-[34px] font-black leading-tight sm:text-[40px]">
            Hello, {firstName} 👋
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">
            {user.profile?.university || "Your university"} · Level {level} ·{" "}
            <span className="text-[var(--mint)]">account active</span>
          </p>
        </div>
        <div className="flex gap-2">
          {user.is_staff && <Link href="/admin" className="btn btn-ghost">Admin portal</Link>}
          <Link href="/opportunities" className="btn btn-primary">Find opportunities →</Link>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Saved opportunities", value: saved.length, icon: "★", tint: "#E8EDFF", color: "#2350FF" },
          { label: "Open for your level", value: recommended.length + saved.length, icon: "🎓", tint: "#E3FBF3", color: "#059669" },
          { label: "Closing in 14 days", value: soonCount, icon: "⏰", tint: "#FFE9E3", color: "#C2410C" },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4 p-5">
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl text-xl"
              style={{ background: s.tint, color: s.color }}
            >
              {s.icon}
            </span>
            <div>
              <p className="text-[26px] font-black leading-none">{s.value}</p>
              <p className="mt-1 text-[12px] font-semibold text-[var(--ink-soft)]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-black">Saved for later</h2>
            <Link href="/opportunities" className="text-[12.5px] font-bold text-[var(--cobalt)] hover:underline">
              Add more
            </Link>
          </div>

          {saved.length === 0 ? (
            <div className="card mt-4 p-8 text-center">
              <p className="text-3xl">☆</p>
              <p className="mt-2 text-[14px] font-bold">Nothing saved yet</p>
              <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                Open any opportunity and tap “Save for later” to keep it here.
              </p>
              <Link href="/opportunities" className="btn btn-primary mt-5">Browse opportunities</Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {saved.map((op) => (
                <OpportunityCard key={op.id} op={op} compact />
              ))}
            </div>
          )}

          {recommended.length > 0 && (
            <>
              <h2 className="mt-10 text-[22px] font-black">Picked for Level {level}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {recommended.map((op) => (
                  <OpportunityCard key={op.id} op={op} compact />
                ))}
              </div>
            </>
          )}
        </section>

        <aside>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-black">Deadline watchlist</h2>
              <span className="pill bg-[#FFE9E3] text-[#C2410C]">21 days</span>
            </div>
            {closing.length === 0 ? (
              <p className="mt-4 text-[13px] text-[var(--ink-soft)]">
                No deadlines in the next three weeks. Good time to prepare documents.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {closing.map((op) => (
                  <li key={op.id}>
                    <Link
                      href={`/opportunities/${op.slug}`}
                      className="flex items-start gap-3 rounded-xl border border-[var(--line)] p-3 transition hover:border-[var(--cobalt)]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--cream)] text-[11px] font-black text-[var(--coral)]">
                        {op.days_left}d
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-bold">{op.title}</span>
                        <span className="block truncate text-[11px] text-[var(--ink-soft)]">{op.provider}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card mt-4 p-5">
            <h2 className="text-[17px] font-black">Your profile</h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-soft)]">Name</dt>
                <dd className="text-right font-bold">{user.first_name} {user.last_name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-soft)]">Email</dt>
                <dd className="truncate text-right font-bold">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-soft)]">Level</dt>
                <dd className="text-right font-bold">{level}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-soft)]">Joined</dt>
                <dd className="text-right font-bold">
                  {new Date(user.date_joined).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card mt-4 bg-[var(--ink)] p-5 text-white">
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[var(--amber)]">Need help?</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              Tap the blue chat button and ask Pulse about documents, deadlines or which scholarships
              fit your level.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

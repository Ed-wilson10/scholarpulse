"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { authFetch, fetchMe } from "@/lib/api";
import type { User } from "@/lib/types";

type AdminOpp = {
  id: number;
  title: string;
  slug: string;
  provider: string;
  kind: string;
  category_id: number | null;
  summary: string;
  description: string;
  eligibility: string;
  documents: string[];
  levels: string[];
  study_level: string;
  funding: string;
  countries: string;
  host_country: string;
  deadline: string | null;
  application_url: string;
  source_url: string;
  image_url: string;
  tags: string[];
  featured: boolean;
  is_active: boolean;
  verified: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

type Stats = {
  opportunities: number;
  active: number;
  closing_soon: number;
  users: number;
  new_users_7d: number;
  subscribers: number;
  chats: number;
  by_kind: { kind: string; count: number }[];
};

type Chat = {
  id: number;
  message: string;
  answer: string;
  intent: string;
  created_at: string;
};

type Category = { id: number; name: string; slug: string; color: string };

type FormState = {
  title: string;
  provider: string;
  kind: string;
  category_id: string;
  summary: string;
  description: string;
  eligibility: string;
  documents: string;
  levels: string[];
  study_level: string;
  funding: string;
  countries: string;
  host_country: string;
  deadline: string;
  application_url: string;
  source_url: string;
  image_url: string;
  tags: string;
  featured: boolean;
  is_active: boolean;
  verified: boolean;
};

const EMPTY: FormState = {
  title: "",
  provider: "",
  kind: "scholarship",
  category_id: "",
  summary: "",
  description: "",
  eligibility: "",
  documents: "",
  levels: ["100", "200", "300", "400"],
  study_level: "any",
  funding: "full",
  countries: "Ghana",
  host_country: "",
  deadline: "",
  application_url: "",
  source_url: "",
  image_url: "",
  tags: "",
  featured: false,
  is_active: true,
  verified: false,
};

function unwrap<T>(data: T[] | { results: T[] } | unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data) {
    return ((data as { results: T[] }).results || []) as T[];
  }
  return [];
}

function fmtDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminPortalPage() {
  const [me, setMe] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"overview" | "listings" | "users" | "chats">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [opps, setOpps] = useState<AdminOpp[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<AdminOpp | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchMe()
      .then((data) => setMe(data))
      .finally(() => setChecking(false));
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, oppsRes, usersRes, chatsRes, catRes] = await Promise.all([
        authFetch("/admin/stats/"),
        authFetch("/admin/opportunities/"),
        authFetch("/admin/users/"),
        authFetch("/admin/chats/"),
        authFetch("/categories/"),
      ]);

      if (!statsRes.ok) {
        setError("The admin API returned an error. Check that you are signed in as staff.");
        return;
      }

      setStats(await statsRes.json());
      setOpps(unwrap<AdminOpp>(await oppsRes.json()));
      setUsers(unwrap<User>(await usersRes.json()));
      setChats(unwrap<Chat>(await chatsRes.json()));
      setCategories(unwrap<Category>(await catRes.json()));
    } catch {
      setError("Could not reach the backend. Is the Django server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (me?.is_staff) loadAll();
  }, [me, loadAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const kindCounts = useMemo(() => {
    const map: Record<string, number> = {};
    opps.forEach((o) => {
      map[o.kind] = (map[o.kind] || 0) + 1;
    });
    return map;
  }, [opps]);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setFormError("");
    setPanelOpen(true);
  }

  function openEdit(op: AdminOpp) {
    setEditing(op);
    setForm({
      title: op.title,
      provider: op.provider,
      kind: op.kind,
      category_id: op.category_id ? String(op.category_id) : "",
      summary: op.summary,
      description: op.description,
      eligibility: op.eligibility,
      documents: (op.documents || []).join("\n"),
      levels: op.levels || [],
      study_level: op.study_level,
      funding: op.funding,
      countries: op.countries,
      host_country: op.host_country,
      deadline: op.deadline || "",
      application_url: op.application_url,
      source_url: op.source_url,
      image_url: op.image_url,
      tags: (op.tags || []).join(", "),
      featured: op.featured,
      is_active: op.is_active,
      verified: op.verified,
    });
    setFormError("");
    setPanelOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleLevel(level: string) {
    setForm((f) => ({
      ...f,
      levels: f.levels.includes(level)
        ? f.levels.filter((l) => l !== level)
        : [...f.levels, level].sort(),
    }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      title: form.title.trim(),
      provider: form.provider.trim(),
      kind: form.kind,
      category_id: form.category_id ? Number(form.category_id) : null,
      summary: form.summary.trim(),
      description: form.description,
      eligibility: form.eligibility,
      documents: form.documents.split("\n").map((s) => s.trim()).filter(Boolean),
      levels: form.levels,
      study_level: form.study_level,
      funding: form.funding,
      countries: form.countries.trim(),
      host_country: form.host_country.trim(),
      deadline: form.deadline || null,
      application_url: form.application_url.trim(),
      source_url: form.source_url.trim(),
      image_url: form.image_url.trim(),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
      is_active: form.is_active,
      verified: form.verified,
    };

    try {
      const url = editing
        ? `/admin/opportunities/${editing.slug}/`
        : "/admin/opportunities/";
      const res = await authFetch(url, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const first = Object.entries(body)[0];
        setFormError(
          first
            ? `${first[0]}: ${Array.isArray(first[1]) ? first[1].join(" ") : String(first[1])}`
            : "Could not save this opportunity."
        );
        return;
      }

      setPanelOpen(false);
      setToast(editing ? "Opportunity updated." : "Opportunity added.");
      await loadAll();
    } catch {
      setFormError("Network error. Is the Django server running?");
    } finally {
      setSaving(false);
    }
  }

  async function remove(op: AdminOpp) {
    if (!window.confirm(`Delete “${op.title}”? This cannot be undone.`)) return;
    const res = await authFetch(`/admin/opportunities/${op.slug}/`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setToast("Opportunity deleted.");
      await loadAll();
    } else {
      setToast("Could not delete that listing.");
    }
  }

  async function toggleField(op: AdminOpp, field: "is_active" | "featured" | "verified") {
    const res = await authFetch(`/admin/opportunities/${op.slug}/`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: !op[field] }),
    });
    if (res.ok) {
      setOpps((list) => list.map((o) => (o.id === op.id ? { ...o, [field]: !op[field] } : o)));
    }
  }

  if (checking) {
    return (
      <div className="container-x py-20">
        <div className="mx-auto h-40 max-w-lg animate-pulse rounded-3xl bg-black/5" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="container-x py-20">
        <div className="card mx-auto max-w-md p-10 text-center">
          <p className="text-4xl">🔐</p>
          <h1 className="mt-4 text-2xl font-black">Staff log in required</h1>
          <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">
            The admin portal is only available to team accounts with staff access.
          </p>
          <Link href="/login?next=/admin" className="btn btn-primary mt-6">Log in</Link>
        </div>
      </div>
    );
  }

  if (!me.is_staff) {
    return (
      <div className="container-x py-20">
        <div className="card mx-auto max-w-md p-10 text-center">
          <p className="text-4xl">🚫</p>
          <h1 className="mt-4 text-2xl font-black">This account is not staff</h1>
          <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">
            Ask a team lead to grant your account admin rights in the Django admin, or use the seeded
            demo admin account.
          </p>
          <Link href="/dashboard" className="btn btn-ghost mt-6">Back to my dashboard</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "listings", label: `Opportunities (${opps.length})`, icon: "🎓" },
    { id: "users", label: `New accounts (${users.length})`, icon: "👥" },
    { id: "chats", label: "Chatbot logs", icon: "💬" },
  ] as const;

  return (
    <div className="container-x py-9">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--coral)]">
            Team only · admin portal
          </p>
          <h1 className="mt-2 text-[34px] font-black leading-tight sm:text-[42px]">
            ScholarPulse control room
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">
            Manage listings, watch new sign-ups, and see what students ask the assistant.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadAll} disabled={loading} className="btn btn-ghost">
            {loading ? "Refreshing…" : "↻ Refresh data"}
          </button>
          <button onClick={openNew} className="btn btn-primary">+ New opportunity</button>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-2xl bg-[#FFE9E3] px-5 py-3.5 text-[13px] font-semibold text-[#C2410C]">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-1.5 rounded-2xl border border-[var(--line)] bg-white p-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2.5 text-[12.5px] font-bold transition ${
              tab === t.id ? "bg-[var(--ink)] text-white" : "text-[var(--ink-soft)] hover:bg-[var(--cream)]"
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------------- OVERVIEW ---------------- */}
      {tab === "overview" && (
        <div className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total opportunities", value: stats?.opportunities ?? opps.length, tint: "#E8EDFF", color: "#2350FF", icon: "🎓" },
              { label: "Active listings", value: stats?.active ?? opps.filter((o) => o.is_active).length, tint: "#E3FBF3", color: "#059669", icon: "✅" },
              { label: "Closing in 30 days", value: stats?.closing_soon ?? 0, tint: "#FFE9E3", color: "#C2410C", icon: "⏰" },
              { label: "Registered students", value: stats?.users ?? users.length, tint: "#FFF4DC", color: "#B45309", icon: "👥" },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-lg" style={{ background: s.tint, color: s.color }}>
                    {s.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--ink-soft)]/60">
                    live
                  </span>
                </div>
                <p className="mt-4 text-[30px] font-black leading-none">{s.value}</p>
                <p className="mt-1.5 text-[12px] font-semibold text-[var(--ink-soft)]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-6">
              <h2 className="text-[17px] font-black">Listings by type</h2>
              <div className="mt-5 space-y-3">
                {Object.keys(kindCounts).length === 0 && (
                  <p className="text-[13px] text-[var(--ink-soft)]">No listings yet.</p>
                )}
                {Object.entries(kindCounts).map(([kind, count]) => {
                  const pct = Math.round((count / Math.max(opps.length, 1)) * 100);
                  return (
                    <div key={kind}>
                      <div className="flex items-center justify-between text-[12px] font-bold capitalize">
                        <span>{kind === "tech" ? "Tech training" : kind}</span>
                        <span className="text-[var(--ink-soft)]">{count}</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--cream)]">
                        <div
                          className="h-full rounded-full bg-[var(--cobalt)]"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-[17px] font-black">Engagement</h2>
              <dl className="mt-4 space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--ink-soft)]">Newsletter subscribers</dt>
                  <dd className="font-black">{stats?.subscribers ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--ink-soft)]">New accounts (7 days)</dt>
                  <dd className="font-black">{stats?.new_users_7d ?? 0}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--ink-soft)]">Chatbot messages</dt>
                  <dd className="font-black">{stats?.chats ?? chats.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--ink-soft)]">Total page views (listings)</dt>
                  <dd className="font-black">{opps.reduce((sum, o) => sum + o.views, 0)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card mt-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-black">Latest sign-ups</h2>
              <button onClick={() => setTab("users")} className="text-[12px] font-bold text-[var(--cobalt)] hover:underline">
                View all →
              </button>
            </div>
            {users.length === 0 ? (
              <p className="mt-3 text-[13px] text-[var(--ink-soft)]">No student accounts yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-[var(--line)] text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                      <th className="pb-2 font-black">Student</th>
                      <th className="pb-2 font-black">University</th>
                      <th className="pb-2 font-black">Level</th>
                      <th className="pb-2 font-black">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((u) => (
                      <tr key={u.id} className="border-b border-[var(--line)]/60 last:border-0">
                        <td className="py-2.5">
                          <span className="block font-bold">{u.first_name} {u.last_name}</span>
                          <span className="block text-[11px] text-[var(--ink-soft)]">{u.email}</span>
                        </td>
                        <td className="py-2.5">{u.profile?.university || "—"}</td>
                        <td className="py-2.5">{u.profile?.level || "—"}</td>
                        <td className="py-2.5">{fmtDate(u.date_joined)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- LISTINGS ---------------- */}
      {tab === "listings" && (
        <div className="mt-6">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
              <h2 className="text-[16px] font-black">All opportunities</h2>
              <p className="text-[11.5px] text-[var(--ink-soft)]">
                Click a status chip to toggle it. Slug is generated from the title.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-[12.5px]">
                <thead>
                  <tr className="bg-[var(--cream)] text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                    <th className="px-5 py-3 font-black">Opportunity</th>
                    <th className="px-3 py-3 font-black">Type</th>
                    <th className="px-3 py-3 font-black">Deadline</th>
                    <th className="px-3 py-3 font-black">Views</th>
                    <th className="px-3 py-3 font-black">Status</th>
                    <th className="px-5 py-3 text-right font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {opps.map((op) => (
                    <tr key={op.id} className="border-t border-[var(--line)]/70 align-top">
                      <td className="max-w-[320px] px-5 py-3.5">
                        <span className="block font-bold leading-snug">{op.title}</span>
                        <span className="mt-0.5 block text-[11px] text-[var(--ink-soft)]">
                          {op.provider} · {op.study_level}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 capitalize">{op.kind === "tech" ? "Tech training" : op.kind}</td>
                      <td className="px-3 py-3.5">{fmtDate(op.deadline)}</td>
                      <td className="px-3 py-3.5">{op.views}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => toggleField(op, "is_active")}
                            className={`rounded-full px-2 py-1 text-[10px] font-black ${
                              op.is_active ? "bg-[#E3FBF3] text-[#059669]" : "bg-[#F1F2F6] text-[#6B7280]"
                            }`}
                          >
                            {op.is_active ? "Active" : "Hidden"}
                          </button>
                          <button
                            onClick={() => toggleField(op, "featured")}
                            className={`rounded-full px-2 py-1 text-[10px] font-black ${
                              op.featured ? "bg-[#FFF4DC] text-[#B45309]" : "bg-[#F1F2F6] text-[#6B7280]"
                            }`}
                          >
                            ★ Featured
                          </button>
                          <button
                            onClick={() => toggleField(op, "verified")}
                            className={`rounded-full px-2 py-1 text-[10px] font-black ${
                              op.verified ? "bg-[#E8EDFF] text-[#2350FF]" : "bg-[#F1F2F6] text-[#6B7280]"
                            }`}
                          >
                            ✓ Verified
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex gap-1.5">
                          <Link
                            href={`/opportunities/${op.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-[11px] font-bold hover:border-[var(--cobalt)]"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => openEdit(op)}
                            className="rounded-lg bg-[var(--ink)] px-2.5 py-1.5 text-[11px] font-bold text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => remove(op)}
                            className="rounded-lg border border-[#FF5A36]/30 px-2.5 py-1.5 text-[11px] font-bold text-[#C2410C] hover:bg-[#FFE9E3]"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {opps.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-[var(--ink-soft)]">
                        No opportunities yet. Use “New opportunity” to add the first one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- USERS ---------------- */}
      {tab === "users" && (
        <div className="mt-6 card overflow-hidden">
          <div className="border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-[16px] font-black">Student accounts</h2>
            <p className="text-[11.5px] text-[var(--ink-soft)]">
              Newest first. Saved counts show how many listings each student bookmarked.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[12.5px]">
              <thead>
                <tr className="bg-[var(--cream)] text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                  <th className="px-5 py-3 font-black">Student</th>
                  <th className="px-3 py-3 font-black">University</th>
                  <th className="px-3 py-3 font-black">Level</th>
                  <th className="px-3 py-3 font-black">Saved</th>
                  <th className="px-3 py-3 font-black">Joined</th>
                  <th className="px-5 py-3 font-black">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-[var(--line)]/70">
                    <td className="px-5 py-3">
                      <span className="block font-bold">
                        {u.first_name} {u.last_name}
                        {u.is_staff && <span className="ml-2 rounded bg-[#E8EDFF] px-1.5 py-0.5 text-[9.5px] font-black text-[var(--cobalt)]">STAFF</span>}
                      </span>
                      <span className="block text-[11px] text-[var(--ink-soft)]">{u.email}</span>
                    </td>
                    <td className="px-3 py-3">{u.profile?.university || "—"}</td>
                    <td className="px-3 py-3">{u.profile?.level || "—"}</td>
                    <td className="px-3 py-3">{u.saved?.length ?? 0}</td>
                    <td className="px-3 py-3">{fmtDate(u.date_joined)}</td>
                    <td className="px-5 py-3">{u.is_staff ? "Team" : "Student"}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[var(--ink-soft)]">
                      No student accounts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- CHATS ---------------- */}
      {tab === "chats" && (
        <div className="mt-6 space-y-3">
          <div className="card p-5">
            <h2 className="text-[16px] font-black">What students are asking</h2>
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">
              The last 100 chatbot messages, newest first. Use this to spot missing documents or unclear
              deadlines in the database.
            </p>
          </div>
          {chats.length === 0 && (
            <div className="card p-8 text-center text-[13px] text-[var(--ink-soft)]">
              No chatbot messages yet.
            </div>
          )}
          {chats.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="pill bg-[#E8EDFF] text-[var(--cobalt)]">{c.intent || "chat"}</span>
                <span className="text-[11px] text-[var(--ink-soft)]">
                  {new Date(c.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-3 rounded-xl bg-[var(--cream)] px-4 py-2.5 text-[13px] font-bold">
                {c.message}
              </p>
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                {c.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- FORM PANEL ---------------- */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0b1220]/55 p-3 py-8 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-5 py-4">
              <div>
                <h2 className="text-[18px] font-black">
                  {editing ? "Edit opportunity" : "Add a new opportunity"}
                </h2>
                <p className="text-[11.5px] text-[var(--ink-soft)]">
                  Fields marked * are required. The public page updates immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--cream)] text-lg"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto px-5 py-5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label">Title *</label>
                  <input required value={form.title} onChange={(e) => set("title", e.target.value)} className="field" placeholder="Mastercard Foundation Scholars Program" />
                </div>
                <div>
                  <label className="label">Provider *</label>
                  <input required value={form.provider} onChange={(e) => set("provider", e.target.value)} className="field" placeholder="Mastercard Foundation" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className="field">
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Type *</label>
                  <select value={form.kind} onChange={(e) => set("kind", e.target.value)} className="field">
                    <option value="scholarship">Scholarship</option>
                    <option value="exchange">Exchange program</option>
                    <option value="tech">Tech training</option>
                    <option value="linkedin">LinkedIn opportunity</option>
                    <option value="internship">Internship</option>
                    <option value="graduate">Graduate role</option>
                  </select>
                </div>
                <div>
                  <label className="label">Study level *</label>
                  <select value={form.study_level} onChange={(e) => set("study_level", e.target.value)} className="field">
                    <option value="any">All levels</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="masters">Masters</option>
                    <option value="phd">PhD</option>
                    <option value="training">Training</option>
                  </select>
                </div>
                <div>
                  <label className="label">Funding *</label>
                  <select value={form.funding} onChange={(e) => set("funding", e.target.value)} className="field">
                    <option value="full">Fully funded</option>
                    <option value="partial">Partial funding</option>
                    <option value="stipend">Stipend</option>
                    <option value="paid">Paid</option>
                    <option value="free">Free program</option>
                  </select>
                </div>
                <div>
                  <label className="label">Deadline</label>
                  <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="field" />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Short summary *</label>
                  <input required maxLength={320} value={form.summary} onChange={(e) => set("summary", e.target.value)} className="field" placeholder="One sentence that explains who it is for." />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Full description</label>
                  <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className="field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Eligibility</label>
                  <textarea rows={3} value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} className="field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Documents (one per line)</label>
                  <textarea rows={4} value={form.documents} onChange={(e) => set("documents", e.target.value)} className="field" placeholder={"Academic transcripts\nPassport or national ID\nMotivation letter"} />
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Eligible levels</label>
                  <div className="flex flex-wrap gap-2">
                    {["100", "200", "300", "400"].map((lv) => (
                      <button
                        type="button"
                        key={lv}
                        onClick={() => toggleLevel(lv)}
                        className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold ${
                          form.levels.includes(lv)
                            ? "bg-[var(--cobalt)] text-white"
                            : "bg-[var(--cream)] text-[var(--ink-soft)]"
                        }`}
                      >
                        Level {lv}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Countries covered</label>
                  <input value={form.countries} onChange={(e) => set("countries", e.target.value)} className="field" placeholder="Ghana, Nigeria, Kenya" />
                </div>
                <div>
                  <label className="label">Host country</label>
                  <input value={form.host_country} onChange={(e) => set("host_country", e.target.value)} className="field" placeholder="United Kingdom" />
                </div>
                <div>
                  <label className="label">Application URL</label>
                  <input type="url" value={form.application_url} onChange={(e) => set("application_url", e.target.value)} className="field" placeholder="https://…" />
                </div>
                <div>
                  <label className="label">Source URL</label>
                  <input type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} className="field" placeholder="https://…" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Image URL</label>
                  <input type="url" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} className="field" placeholder="https://images.unsplash.com/…" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className="field" placeholder="fully funded, masters, africa" />
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-5 rounded-2xl bg-[var(--cream)] px-4 py-3.5">
                  {[
                    { key: "featured", label: "Featured on home page" },
                    { key: "is_active", label: "Visible on the site" },
                    { key: "verified", label: "Source checked" },
                  ].map((f) => (
                    <label key={f.key} className="flex cursor-pointer items-center gap-2 text-[12.5px] font-semibold">
                      <input
                        type="checkbox"
                        checked={form[f.key as "featured" | "is_active" | "verified"]}
                        onChange={(e) => set(f.key as "featured" | "is_active" | "verified", e.target.checked)}
                        className="h-4 w-4 accent-[var(--cobalt)]"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="mt-4 rounded-xl bg-[#FFE9E3] px-4 py-3 text-[12.5px] font-semibold text-[#C2410C]">
                  {formError}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-4">
              <p className="text-[11px] text-[var(--ink-soft)]">
                {editing ? `Editing “${editing.title}”` : "A URL-friendly slug is created automatically."}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPanelOpen(false)} className="btn btn-ghost !py-2.5">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary !py-2.5">
                  {saving ? "Saving…" : editing ? "Save changes" : "Publish opportunity"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[var(--ink)] px-5 py-3 text-[12.5px] font-bold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}

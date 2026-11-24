"use client";

import { useMemo, useState } from "react";
import type { Opportunity } from "@/lib/types";
import OpportunityCard from "./OpportunityCard";

const KINDS = [
  { value: "", label: "All" },
  { value: "scholarship", label: "Scholarships" },
  { value: "exchange", label: "Exchange" },
  { value: "tech", label: "Tech training" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "internship", label: "Internships" },
  { value: "graduate", label: "Graduate roles" },
];

const LEVELS = ["100", "200", "300", "400"];
const STUDY = [
  { value: "", label: "Any study level" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
  { value: "training", label: "Training" },
];
const FUNDING = [
  { value: "", label: "Any funding" },
  { value: "full", label: "Fully funded" },
  { value: "partial", label: "Partial funding" },
  { value: "paid", label: "Paid" },
  { value: "free", label: "Free" },
  { value: "stipend", label: "Stipend" },
];

export default function OpportunityExplorer({
  opportunities,
  initialKind = "",
  initialStudy = "",
  initialQuery = "",
}: {
  opportunities: Opportunity[];
  initialKind?: string;
  initialStudy?: string;
  initialQuery?: string;
}) {
  const [kind, setKind] = useState(initialKind);
  const [level, setLevel] = useState("");
  const [study, setStudy] = useState(initialStudy);
  const [funding, setFunding] = useState("");
  const [openOnly, setOpenOnly] = useState(true);
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState<"deadline" | "newest" | "title">("deadline");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = opportunities.filter((op) => {
      if (kind && op.kind !== kind) return false;
      if (level && !(op.levels || []).includes(level)) return false;
      if (study && op.study_level !== study) return false;
      if (funding && op.funding !== funding) return false;
      if (openOnly && !op.is_open) return false;
      if (needle) {
        const hay = `${op.title} ${op.provider} ${op.summary} ${(op.tags || []).join(" ")} ${op.countries}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "newest") return b.id - a.id;
      const ad = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
    return list;
  }, [opportunities, kind, level, study, funding, openOnly, q, sort]);

  const hasFilters = !!(kind || level || study || funding || q || !openOnly);

  function reset() {
    setKind("");
    setLevel("");
    setStudy("");
    setFunding("");
    setQ("");
    setOpenOnly(true);
  }

  return (
    <div>
      <div className="card sticky top-[84px] z-20 p-4 md:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--ink-soft)]">
                🔍
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search scholarships, providers, countries…"
                className="field !pl-10"
                aria-label="Search opportunities"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:w-auto">
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="field !py-3" aria-label="Level">
                <option value="">Any level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
              <select value={study} onChange={(e) => setStudy(e.target.value)} className="field !py-3" aria-label="Study level">
                {STUDY.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select value={funding} onChange={(e) => setFunding(e.target.value)} className="field !py-3" aria-label="Funding">
                {FUNDING.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field !py-3" aria-label="Sort">
                <option value="deadline">Closing soonest</option>
                <option value="newest">Newest</option>
                <option value="title">A–Z</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k.value}
                onClick={() => setKind(k.value)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                  kind === k.value
                    ? "bg-[var(--ink)] text-white"
                    : "bg-[var(--cream)] text-[var(--ink-soft)] hover:bg-[#E8EDFF] hover:text-[var(--cobalt)]"
                }`}
              >
                {k.label}
              </button>
            ))}
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-[var(--ink-soft)]">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="h-4 w-4 accent-[var(--cobalt)]"
              />
              Open only
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-[var(--ink-soft)]">
          <span className="font-black text-[var(--ink)]">{results.length}</span>{" "}
          {results.length === 1 ? "opportunity" : "opportunities"}
          {q && <> for “{q}”</>}
        </p>
        {hasFilters && (
          <button onClick={reset} className="text-[12.5px] font-bold text-[var(--cobalt)] hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <p className="text-4xl">🔎</p>
          <h3 className="mt-3 text-xl font-black">Nothing matches yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--ink-soft)]">
            Try removing a filter, searching a provider name, or ask Pulse which scholarships are open.
          </p>
          <button onClick={reset} className="btn btn-primary mt-5">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((op) => (
            <OpportunityCard key={op.id} op={op} />
          ))}
        </div>
      )}
    </div>
  );
}

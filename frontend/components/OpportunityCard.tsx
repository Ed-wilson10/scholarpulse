import Image from "next/image";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";

export const KIND_LABEL: Record<string, string> = {
  scholarship: "Scholarship",
  exchange: "Exchange",
  tech: "Tech training",
  linkedin: "LinkedIn opportunity",
  internship: "Internship",
  graduate: "Graduate role",
};

export const KIND_COLOR: Record<string, { bg: string; text: string }> = {
  scholarship: { bg: "#E8EDFF", text: "#2350FF" },
  exchange: { bg: "#E3FBF3", text: "#059669" },
  tech: { bg: "#F0E8FF", text: "#6D28D9" },
  linkedin: { bg: "#FFF4DC", text: "#B45309" },
  internship: { bg: "#E4F6FF", text: "#0369A1" },
  graduate: { bg: "#FFE9E3", text: "#C2410C" },
};

export function deadlineLabel(op: Opportunity) {
  if (!op.deadline) return { text: "Rolling", tone: "neutral" as const };
  const days = op.days_left ?? 0;
  const date = new Date(op.deadline).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (days < 0) return { text: `Closed ${date}`, tone: "closed" as const };
  if (days === 0) return { text: "Closes today", tone: "urgent" as const };
  if (days <= 14) return { text: `${days} days left`, tone: "urgent" as const };
  if (days <= 45) return { text: `${days} days left`, tone: "soon" as const };
  return { text: date, tone: "normal" as const };
}

const FALLBACK =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80";

export default function OpportunityCard({ op, compact = false }: { op: Opportunity; compact?: boolean }) {
  const kind = KIND_COLOR[op.kind] || KIND_COLOR.scholarship;
  const dl = deadlineLabel(op);
  const dlClass =
    dl.tone === "urgent"
      ? "bg-[#FFE9E3] text-[#C2410C]"
      : dl.tone === "soon"
        ? "bg-[#FFF4DC] text-[#B45309]"
        : dl.tone === "closed"
          ? "bg-[#F1F2F6] text-[#6B7280]"
          : "bg-[#E3FBF3] text-[#059669]";

  return (
    <Link
      href={`/opportunities/${op.slug}`}
      className="card group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(11,18,32,0.13)]"
    >
      <div className={`relative overflow-hidden ${compact ? "h-36" : "h-44"} bg-[#E8EDFF]`}>
        <Image
          src={op.image_url || FALLBACK}
          alt={op.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/45 via-transparent to-transparent" />
        <span
          className="pill absolute left-3 top-3 shadow-sm"
          style={{ background: kind.bg, color: kind.text }}
        >
          {KIND_LABEL[op.kind] || op.kind}
        </span>
        {op.featured && (
          <span className="pill absolute right-3 top-3 bg-[var(--amber)] text-[#0b1220] shadow-sm">
            ★ Featured
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="pill bg-white/95 text-[10.5px] uppercase tracking-wide text-[var(--ink)]">
            {op.funding === "full"
              ? "Fully funded"
              : op.funding === "partial"
                ? "Partial funding"
                : op.funding === "paid"
                  ? "Paid"
                  : op.funding === "free"
                    ? "Free"
                    : "Stipend"}
          </span>
          <span className={`pill ${dlClass}`}>{dl.text}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--ink-soft)]/80">
          {op.provider}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[16.5px] font-extrabold leading-snug tracking-tight">
          {op.title}
        </h3>
        {!compact && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--ink-soft)]">
            {op.summary}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
          {op.levels?.slice(0, 4).map((lv) => (
            <span
              key={lv}
              className="rounded-md border border-[var(--line)] bg-[var(--cream)] px-1.5 py-0.5 text-[10.5px] font-bold text-[var(--ink-soft)]"
            >
              L{lv}
            </span>
          ))}
          {op.host_country && (
            <span className="ml-auto text-[11px] font-semibold text-[var(--ink-soft)]">
              📍 {op.host_country}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

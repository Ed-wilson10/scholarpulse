import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchOpportunity } from "@/lib/api";
import { KIND_LABEL, deadlineLabel } from "@/components/OpportunityCard";
import SaveButton from "@/components/SaveButton";
import AskPulseButton from "@/components/AskPulseButton";

export const dynamic = "force-dynamic";

const FALLBACK =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let op;
  try {
    op = await fetchOpportunity(slug);
  } catch {
    notFound();
  }

  const dl = deadlineLabel(op);
  const documents = op.documents || [];
  const tags = op.tags || [];

  return (
    <div className="container-x py-8">
      <nav className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[var(--ink-soft)]">
        <Link href="/" className="hover:text-[var(--cobalt)]">Home</Link>
        <span>/</span>
        <Link href="/opportunities" className="hover:text-[var(--cobalt)]">Opportunities</Link>
        <span>/</span>
        <span className="line-clamp-1 text-[var(--ink)]">{op.title}</span>
      </nav>

      <div className="relative mt-5 h-[220px] overflow-hidden rounded-3xl bg-[#E8EDFF] sm:h-[300px]">
        <Image
          src={op.image_url || FALLBACK}
          alt={op.title}
          fill
          priority
          unoptimized
          sizes="(max-width: 1180px) 100vw, 1180px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/75 via-[#0b1220]/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill bg-white text-[var(--ink)]">{KIND_LABEL[op.kind] || op.kind}</span>
            <span className="pill bg-[var(--amber)] text-[#0b1220]">{op.study_level}</span>
            {op.verified && <span className="pill bg-[var(--mint)] text-[#0b1220]">✓ Source checked</span>}
          </div>
          <p className="mt-3 text-[11.5px] font-black uppercase tracking-[0.16em] text-white/65">
            {op.provider}
          </p>
          <h1 className="mt-1 max-w-4xl text-[28px] font-black leading-[1.05] text-white sm:text-[38px]">
            {op.title}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-white text-[var(--ink-soft)] shadow-sm">
              💰{" "}
              {op.funding === "full"
                ? "Fully funded"
                : op.funding === "partial"
                  ? "Partial funding"
                  : op.funding === "paid"
                    ? "Paid"
                    : op.funding === "free"
                      ? "Free program"
                      : "Stipend"}
            </span>
            <span className="pill bg-white text-[var(--ink-soft)] shadow-sm">🌍 {op.countries}</span>
            {op.host_country && (
              <span className="pill bg-white text-[var(--ink-soft)] shadow-sm">📍 {op.host_country}</span>
            )}
            {(op.levels?.length ?? 0) > 0 && (
              <span className="pill bg-white text-[var(--ink-soft)] shadow-sm">
                🎚 Levels {op.levels.join(", ")}
              </span>
            )}
          </div>

          <section className="card mt-6 p-6">
            <h2 className="text-[19px] font-black">Overview</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">
              {op.description || op.summary}
            </p>
          </section>

          <section className="card mt-4 p-6">
            <h2 className="text-[19px] font-black">Who can apply</h2>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-[var(--ink-soft)]">
              {op.eligibility || "Check the official provider page for the full eligibility rules."}
            </p>
          </section>

          <section className="card mt-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[19px] font-black">Documents checklist</h2>
              <span className="pill bg-[#E8EDFF] text-[var(--cobalt)]">{documents.length} items</span>
            </div>
            {documents.length === 0 ? (
              <p className="mt-3 text-[14px] text-[var(--ink-soft)]">
                The provider has not published a fixed list. Prepare your transcript, ID, CV and a
                motivation letter, then confirm on the official page.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {documents.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--cream)] px-3.5 py-2.5 text-[13px] font-semibold"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[var(--cobalt)] text-[10px] text-white">
                      ✓
                    </span>
                    {doc}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-[11.5px] text-[var(--ink-soft)]/80">
              Requirements can change. Always confirm with the official provider before you pay for
              transcripts or courier documents.
            </p>
          </section>

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Link
                  key={t}
                  href={`/opportunities?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[11.5px] font-semibold text-[var(--ink-soft)] hover:border-[var(--cobalt)] hover:text-[var(--cobalt)]"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-[96px] lg:self-start">
          <div className="card p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              Application deadline
            </p>
            <p className="mt-1.5 text-[24px] font-black leading-tight">
              {op.deadline
                ? new Date(op.deadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Rolling / not stated"}
            </p>
            <span
              className={`pill mt-2 ${
                dl.tone === "urgent"
                  ? "bg-[#FFE9E3] text-[#C2410C]"
                  : dl.tone === "closed"
                    ? "bg-[#F1F2F6] text-[#6B7280]"
                    : "bg-[#E3FBF3] text-[#059669]"
              }`}
            >
              {dl.text}
            </span>

            <div className="mt-5 space-y-2">
              {op.application_url ? (
                <a
                  href={op.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full !py-3.5"
                >
                  Apply on official page ↗
                </a>
              ) : (
                <div className="rounded-xl bg-[var(--cream)] px-4 py-3 text-center text-[12.5px] font-semibold text-[var(--ink-soft)]">
                  No application link listed yet
                </div>
              )}
              <SaveButton slug={op.slug} />
              <AskPulseButton
                question={`What documents do I need for ${op.title} and when is the deadline?`}
              />
            </div>

            <div className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-[12.5px]">
              <p className="flex items-start justify-between gap-3">
                <span className="text-[var(--ink-soft)]">Study level</span>
                <span className="text-right font-bold capitalize">{op.study_level}</span>
              </p>
              <p className="flex items-start justify-between gap-3">
                <span className="text-[var(--ink-soft)]">Eligible levels</span>
                <span className="text-right font-bold">
                  {op.levels?.length ? op.levels.map((l) => `L${l}`).join(", ") : "All levels"}
                </span>
              </p>
              <p className="flex items-start justify-between gap-3">
                <span className="text-[var(--ink-soft)]">Host</span>
                <span className="text-right font-bold">{op.host_country || "—"}</span>
              </p>
              <p className="flex items-start justify-between gap-3">
                <span className="text-[var(--ink-soft)]">Views</span>
                <span className="text-right font-bold">{op.views}</span>
              </p>
            </div>

            {op.source_url && (
              <a
                href={op.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-[11.5px] font-semibold text-[var(--cobalt)] hover:underline"
              >
                View source page ↗
              </a>
            )}
          </div>

          <div className="card mt-4 bg-[var(--ink)] p-5 text-white">
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[var(--amber)]">
              Quick tip
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              Start your references early. Lecturers are busy, and most scholarships close without
              extensions. Ask at least three weeks before the deadline.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { fetchOpportunitiesServer } from "@/lib/api";
import OpportunityExplorer from "@/components/OpportunityExplorer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All opportunities — ScholarPulse",
  description:
    "Filter scholarships, exchange programs, tech training, internships and graduate roles for Ghanaian university students.",
};

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; study?: string; q?: string }>;
}) {
  const params = await searchParams;
  const opportunities = await fetchOpportunitiesServer("");

  return (
    <div className="container-x py-10">
      <nav className="flex items-center gap-2 text-[12px] font-semibold text-[var(--ink-soft)]">
        <Link href="/" className="hover:text-[var(--cobalt)]">Home</Link>
        <span>/</span>
        <span className="text-[var(--ink)]">Opportunities</span>
      </nav>

      <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-[38px] font-black leading-[1.02] tracking-[-0.04em] sm:text-[48px]">
            Find your next move.
          </h1>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
            Scholarships, exchanges, free tech training, internships and graduate schemes — all in one
            grid. Filter by your level so you only see what you can actually apply for.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill bg-white text-[var(--ink-soft)] shadow-sm">
            {opportunities.length} live listings
          </span>
          <span className="pill bg-[#E3FBF3] text-[#059669]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            Updated regularly
          </span>
        </div>
      </div>

      <div className="mt-8">
        <OpportunityExplorer
          opportunities={opportunities}
          initialKind={params.kind || ""}
          initialStudy={params.study || ""}
          initialQuery={params.q || ""}
        />
      </div>

      <div className="card mt-14 flex flex-col items-start justify-between gap-5 bg-[#E8EDFF] p-7 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[20px] font-black">Not sure where you fit?</h2>
          <p className="mt-1 max-w-lg text-[13.5px] text-[var(--ink-soft)]">
            Open the Pulse assistant and describe your level, course or the country you want to study
            in. It will point you to the closest matches.
          </p>
        </div>
        <Link href="/register" className="btn btn-primary shrink-0">
          Save opportunities
        </Link>
      </div>
    </div>
  );
}

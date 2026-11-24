import Image from "next/image";
import Link from "next/link";
import { fetchOpportunitiesServer } from "@/lib/api";
import OpportunityCard from "@/components/OpportunityCard";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  {
    name: "Masters scholarships",
    desc: "Fully funded postgraduate study in Ghana, Europe, the UK and beyond.",
    icon: "🎓",
    color: "#2350FF",
    tint: "#E8EDFF",
    href: "/opportunities?study=masters",
  },
  {
    name: "Undergraduate funding",
    desc: "Tuition and maintenance support while you finish your first degree.",
    icon: "📚",
    color: "#FF5A36",
    tint: "#FFE9E3",
    href: "/opportunities?study=undergraduate",
  },
  {
    name: "Exchange programs",
    desc: "A semester or a summer studying abroad, with travel covered.",
    icon: "✈️",
    color: "#059669",
    tint: "#E3FBF3",
    href: "/opportunities?kind=exchange",
  },
  {
    name: "Tech training",
    desc: "AWS re/Start, ALX, Google and other free skills programs.",
    icon: "💻",
    color: "#7C3AED",
    tint: "#F0E8FF",
    href: "/opportunities?kind=tech",
  },
  {
    name: "Graduate roles",
    desc: "Trainee schemes and graduate programs that hire final-year students.",
    icon: "💼",
    color: "#B45309",
    tint: "#FFF4DC",
    href: "/opportunities?kind=linkedin",
  },
  {
    name: "Internships",
    desc: "Paid internships at global tech companies, remote or on site.",
    icon: "🧑‍💻",
    color: "#0369A1",
    tint: "#E4F6FF",
    href: "/opportunities?kind=internship",
  },
];

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    fetchOpportunitiesServer("?featured=true"),
    fetchOpportunitiesServer("?ordering=-created_at"),
  ]);

  const showcase = (featured.length ? featured : latest).slice(0, 6);
  const newest = latest.slice(0, 3);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="hero-blob left-[-140px] top-[-80px] h-[420px] w-[420px] bg-[#FFD166]" />
        <div className="hero-blob right-[-120px] top-[60px] h-[380px] w-[380px] bg-[#7C3AED]/40" />
        <div className="hero-blob bottom-[-160px] left-[35%] h-[360px] w-[360px] bg-[#05C793]/30" />

        <div className="container-x relative grid items-center gap-12 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
          <div>
            <span className="pill border border-[var(--ink)]/10 bg-white text-[var(--ink)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--mint)]" />
              Built for university students in Ghana · Levels 100–400
            </span>

            <h1 className="mt-5 text-[42px] font-black leading-[0.98] tracking-[-0.045em] sm:text-[56px] lg:text-[64px]">
              Your next big
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">opportunity</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-[38%] rounded-sm bg-[var(--amber)]/70" />
              </span>{" "}
              is
              <br />
              one click away.
            </h1>

            <p className="mt-6 max-w-[520px] text-[16px] leading-relaxed text-[var(--ink-soft)]">
              Scholarships, exchange programs, free tech training and graduate roles — collected,
              checked and organised in one place. No noise, no dead links, no guessing where to start.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/opportunities" className="btn btn-primary !px-7 !py-4 !text-[14.5px]">
                Explore opportunities →
              </Link>
              <Link href="/register" className="btn btn-ghost !px-7 !py-4 !text-[14.5px]">
                Create a free account
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12.5px] font-semibold text-[var(--ink-soft)]">
              <span className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#E3FBF3] text-[11px]">✓</span>
                Deadline reminders by email
              </span>
              <span className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#E8EDFF] text-[11px]">✓</span>
                Document checklists
              </span>
              <span className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#FFF4DC] text-[11px]">✓</span>
                Free, always
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-[4/4.5] overflow-hidden rounded-[32px] border-[6px] border-white bg-[#E8EDFF] shadow-[0_35px_90px_rgba(11,18,32,0.22)]">
              <Image
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=85"
                alt="University students laughing together while studying"
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 90vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/55 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
                  This week&apos;s focus
                </p>
                <p className="mt-1 text-[15px] font-extrabold leading-snug text-white">
                  Fully funded masters deadlines are landing. Check yours before December.
                </p>
              </div>
            </div>

            <div className="floaty absolute -left-5 top-8 hidden rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-xl sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Level 300?
              </p>
              <p className="mt-1 text-[13px] font-extrabold">Exchange programs are open</p>
              <p className="mt-1 text-[11px] font-semibold text-[var(--mint)]">Global UGRAD · Erasmus+</p>
            </div>

            <div className="absolute -right-3 bottom-24 hidden rounded-2xl border border-[var(--line)] bg-white p-3.5 shadow-xl sm:block">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFE9E3] text-lg">⏰</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    Closing soon
                  </p>
                  <p className="text-[13px] font-extrabold">{showcase[0]?.days_left ?? "—"} days left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- PROVIDER MARQUEE ---------------- */}
      <section className="border-y border-[var(--line)] bg-[var(--ink)] py-4 text-white">
        <div className="overflow-hidden">
          <div className="marquee-track gap-10">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-10">
                {[
                  "Mastercard Foundation",
                  "Commonwealth Scholarships",
                  "DAAD",
                  "Erasmus Mundus",
                  "AWS re/Start",
                  "AmaliTech",
                  "ALX Africa",
                  "Fulbright",
                  "Mandela Rhodes",
                  "Global UGRAD",
                ].map((name) => (
                  <span
                    key={`${copy}-${name}`}
                    className="whitespace-nowrap text-[12px] font-black uppercase tracking-[0.18em] text-white/45"
                  >
                    {name} <span className="ml-10 text-[var(--amber)]">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="container-x py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--cobalt)]">
              Pick your lane
            </p>
            <h2 className="mt-2 text-[34px] font-black leading-[1.05] sm:text-[42px]">
              Everything a student needs, sorted by what you actually want.
            </h2>
          </div>
          <Link href="/opportunities" className="btn btn-ghost shrink-0">
            Browse all →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="group relative overflow-hidden rounded-3xl border border-[var(--line)] p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(11,18,32,0.1)]"
              style={{ background: c.tint }}
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-[22px] shadow-sm"
                style={{ background: c.color }}
              >
                {c.icon}
              </span>
              <h3 className="mt-5 text-[19px] font-black leading-tight">{c.name}</h3>
              <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[var(--ink-soft)]">{c.desc}</p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-black"
                style={{ color: c.color }}
              >
                See what&apos;s open
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED GRID ---------------- */}
      <section className="bg-white/60 py-20">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--coral)]">
                Handpicked this week
              </p>
              <h2 className="mt-2 text-[34px] font-black leading-[1.05] sm:text-[42px]">
                Featured opportunities
              </h2>
              <p className="mt-3 max-w-lg text-[14px] text-[var(--ink-soft)]">
                Verified programs with real deadlines. Tap a card for the full document checklist and
                official link.
              </p>
            </div>
            <Link href="/opportunities" className="btn btn-ghost shrink-0">
              Browse all →
            </Link>
          </div>

          {showcase.length === 0 ? (
            <div className="card mt-10 p-10 text-center">
              <p className="text-sm text-[var(--ink-soft)]">
                The opportunity database is empty right now. Start the backend and run the seed command.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((op) => (
                <OpportunityCard key={op.id} op={op} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="container-x py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--violet)]">
              No stress, no confusion
            </p>
            <h2 className="mt-2 text-[34px] font-black leading-[1.05] sm:text-[42px]">
              Three steps from “where do I start?” to “I applied.”
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
              Most students miss opportunities because the information is scattered. ScholarPulse keeps
              the deadline, the documents and the official link on one page.
            </p>
            <Link href="/register" className="btn btn-coral mt-7">
              Start with a free account
            </Link>
          </div>

          <div className="space-y-3.5">
            {[
              {
                n: "01",
                t: "Pick a filter that fits you",
                d: "Choose your level, study type and funding preference. The grid updates instantly.",
                color: "#2350FF",
              },
              {
                n: "02",
                t: "Check the documents and deadline",
                d: "Every listing shows what to prepare and how many days are left before it closes.",
                color: "#FF5A36",
              },
              {
                n: "03",
                t: "Ask Pulse when you are unsure",
                d: "The assistant answers scholarship questions only — types, documents, deadlines, eligibility.",
                color: "#059669",
              },
            ].map((s) => (
              <div key={s.n} className="card flex items-start gap-5 p-5">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[14px] font-black text-white"
                  style={{ background: s.color }}
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[16px] font-extrabold">{s.t}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-soft)]">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CHATBOT CALLOUT ---------------- */}
      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-[36px] bg-[var(--ink)] px-6 py-14 text-white sm:px-12">
          <div className="hero-blob right-[-60px] top-[-100px] h-[320px] w-[320px] bg-[#2350FF]" />
          <div className="hero-blob bottom-[-120px] left-[20%] h-[280px] w-[280px] bg-[#FF5A36]/70" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="pill bg-[var(--mint)] text-[#0b1220]">AI assistant · in scope only</span>
              <h2 className="mt-4 text-[32px] font-black leading-[1.05] sm:text-[40px]">
                Stuck on a question? Ask Pulse.
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/65">
                A small, focused chatbot that only talks about scholarships. It knows your live
                opportunity database — so when a deadline changes, its answers change too.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Scholarship types", "Documents needed", "Deadlines", "Eligibility"].map((t) => (
                  <span key={t} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/75">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="space-y-3">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--cobalt)] px-4 py-3 text-[13px]">
                  What documents do I need for a masters scholarship?
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[13px] leading-relaxed text-[var(--ink)]">
                  Most masters applications want transcripts, a motivation letter, two references,
                  a passport copy and proof of English. For DAAD EPOS you also need proof of two
                  years&apos; work experience. Want me to list the full checklist?
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/80">
                    Show upcoming deadlines
                  </span>
                  <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/80">
                    Masters only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- NEWEST ---------------- */}
      {newest.length > 0 && (
        <section className="container-x pb-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--mint)]">
                Just added
              </p>
              <h2 className="mt-2 text-[30px] font-black leading-[1.05] sm:text-[36px]">
                Fresh in the database
              </h2>
            </div>
            <Link href="/opportunities?ordering=newest" className="text-[13px] font-black text-[var(--cobalt)] hover:underline">
              See everything new →
            </Link>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {newest.map((op) => (
              <OpportunityCard key={op.id} op={op} compact />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

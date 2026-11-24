import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Log in — ScholarPulse" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
      <div className="mx-auto w-full max-w-[440px]">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--cobalt)]">
          Welcome back
        </p>
        <h1 className="mt-2 text-[38px] font-black leading-[1.02]">Log in to ScholarPulse</h1>
        <p className="mt-3 text-[14px] text-[var(--ink-soft)]">
          Pick up your saved opportunities and deadline reminders where you left off.
        </p>

        <div className="card mt-7 p-6">
          <LoginForm next={next || "/dashboard"} />
        </div>

        <p className="mt-5 text-center text-[13px] text-[var(--ink-soft)]">
          New here?{" "}
          <Link href="/register" className="font-black text-[var(--cobalt)] hover:underline">
            Create a free account
          </Link>
        </p>
      </div>

      <div className="relative hidden overflow-hidden rounded-[32px] bg-[var(--ink)] p-9 text-white lg:block">
        <div className="hero-blob right-[-80px] top-[-60px] h-[260px] w-[260px] bg-[#2350FF]" />
        <div className="hero-blob bottom-[-100px] left-[-40px] h-[240px] w-[240px] bg-[#FF5A3C]/70" />
        <div className="relative">
          <span className="pill bg-[var(--amber)] text-[#0b1220]">Free forever</span>
          <h2 className="mt-5 text-[30px] font-black leading-[1.08]">
            One account. Every deadline in one place.
          </h2>
          <ul className="mt-7 space-y-4 text-[13.5px] text-white/70">
            {[
              "Save scholarships and come back to them later",
              "See only the opportunities your level qualifies for",
              "Ask Pulse about documents and deadlines",
              "Get a short email before things close",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--mint)] text-[10px] font-black text-[#0b1220]">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

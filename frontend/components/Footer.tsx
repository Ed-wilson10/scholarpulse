import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[var(--line)] bg-[#0b1220] text-white">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white text-[var(--cobalt)]">
              <span className="text-lg font-black">S</span>
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0b1220] bg-[var(--coral)]" />
            </span>
            <span className="text-[19px] font-black">
              Scholar<span className="text-[var(--amber)]">Pulse</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            A student-built hub for scholarships, exchange programs, tech training and graduate
            opportunities. Built for Ghanaian university students, Levels 100 to 400.
          </p>
          <p className="mt-5 text-xs text-white/40">
            Always confirm details on the official provider page before applying.
          </p>
        </div>

        <div>
          <h4 className="text-[12px] font-black uppercase tracking-[0.16em] text-white/40">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href="/opportunities" className="hover:text-[var(--amber)]">All opportunities</Link></li>
            <li><Link href="/opportunities?kind=scholarship" className="hover:text-[var(--amber)]">Scholarships</Link></li>
            <li><Link href="/opportunities?kind=exchange" className="hover:text-[var(--amber)]">Exchange programs</Link></li>
            <li><Link href="/opportunities?kind=tech" className="hover:text-[var(--amber)]">Tech training</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-black uppercase tracking-[0.16em] text-white/40">Account</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-white/75">
            <li><Link href="/register" className="hover:text-[var(--amber)]">Create account</Link></li>
            <li><Link href="/login" className="hover:text-[var(--amber)]">Log in</Link></li>
            <li><Link href="/dashboard" className="hover:text-[var(--amber)]">My dashboard</Link></li>
            <li><Link href="/admin" className="hover:text-[var(--amber)]">Team admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[12px] font-black uppercase tracking-[0.16em] text-white/40">
            Deadline alerts
          </h4>
          <p className="mt-4 text-sm text-white/60">
            Get a short email when new scholarships and deadlines are added.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} ScholarPulse. Built in Accra, Ghana.</p>
          <p>Scholarships • Exchange • Tech training • Graduate roles</p>
        </div>
      </div>
    </footer>
  );
}

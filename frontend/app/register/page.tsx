import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Create account — ScholarPulse" };

export default function RegisterPage() {
  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="relative order-2 hidden overflow-hidden rounded-[32px] bg-[#E8EDFF] p-9 lg:order-1 lg:block">
        <span className="pill bg-white text-[var(--cobalt)] shadow-sm">Levels 100 → 400</span>
        <h2 className="mt-5 text-[32px] font-black leading-[1.05]">
          Built around how students actually search.
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--ink-soft)]">
          You should not need to scroll through five WhatsApp groups to find one working application
          link. Filter by your level, save what fits, and move on with your semester.
        </p>

        <div className="mt-8 space-y-3">
          {[
            { icon: "🎓", text: "Scholarships for undergraduate and masters study" },
            { icon: "✈️", text: "Exchange semesters in the US and Europe" },
            { icon: "💻", text: "Free tech training like AWS re/Start" },
            { icon: "💼", text: "Graduate roles and paid internships" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-[13px] font-semibold">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="order-1 mx-auto w-full max-w-[480px] lg:order-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--coral)]">
          Join free
        </p>
        <h1 className="mt-2 text-[38px] font-black leading-[1.02]">Create your account</h1>
        <p className="mt-3 text-[14px] text-[var(--ink-soft)]">
          Takes less than a minute. No fees, no spam, no application promises.
        </p>

        <div className="card mt-7 p-6">
          <RegisterForm />
        </div>

        <p className="mt-5 text-center text-[13px] text-[var(--ink-soft)]">
          Already have an account?{" "}
          <Link href="/login" className="font-black text-[var(--cobalt)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

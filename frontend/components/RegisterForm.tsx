"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    university: "University of Cape Coast",
    level: "400",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);
    try {
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        university: form.university,
        level: form.level,
        password: form.password,
      });
      await login(form.email.trim(), form.password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="first_name">First name</label>
          <input
            id="first_name"
            required
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            placeholder="Emmanuel"
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            required
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            placeholder="Sey"
            className="field"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="reg_email">Email address</label>
        <input
          id="reg_email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@example.com"
          className="field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="university">University</label>
          <input
            id="university"
            value={form.university}
            onChange={(e) => set("university", e.target.value)}
            className="field"
          />
        </div>
        <div>
          <label className="label" htmlFor="level">Level</label>
          <select id="level" value={form.level} onChange={(e) => set("level", e.target.value)} className="field">
            <option value="100">Level 100</option>
            <option value="200">Level 200</option>
            <option value="300">Level 300</option>
            <option value="400">Level 400</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="reg_password">Password</label>
        <input
          id="reg_password"
          type="password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="At least 8 characters"
          className="field"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-[#FFE9E3] px-4 py-3 text-[12.5px] font-semibold text-[#C2410C]">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary w-full !py-3.5">
        {busy ? "Creating account…" : "Create free account"}
      </button>

      <p className="text-center text-[11.5px] leading-relaxed text-[var(--ink-soft)]">
        By signing up you agree that ScholarPulse is a discovery tool. Always verify details with the
        official provider.
      </p>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { authFetch, fetchMe, getToken } from "@/lib/api";

export default function SaveButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    fetchMe()
      .then((me) => {
        if (me?.saved) setSaved(me.saved.includes(slug));
      })
      .finally(() => setReady(true));
  }, [slug]);

  async function toggle() {
    if (!getToken()) {
      window.location.href = `/login?next=/opportunities/${slug}`;
      return;
    }
    setBusy(true);
    try {
      const res = await authFetch(`/saved/${slug}/`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy || !ready}
      className={`btn w-full ${saved ? "bg-[#E3FBF3] text-[#059669]" : "btn-ghost"}`}
    >
      {busy ? "Saving…" : saved ? "★ Saved to my dashboard" : "☆ Save for later"}
    </button>
  );
}

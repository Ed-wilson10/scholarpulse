"use client";

export default function AskPulseButton({
  question,
  className = "btn btn-ghost w-full",
  label = "Ask Pulse about this",
}: {
  question: string;
  className?: string;
  label?: string;
}) {
  return (
    <button
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("sp-ask", { detail: { question } }));
      }}
    >
      💬 {label}
    </button>
  );
}

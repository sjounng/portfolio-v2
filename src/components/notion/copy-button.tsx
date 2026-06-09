"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M3.5 10.5h-.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3.5 8.5l3 3 6-6.5" />
    </svg>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard 사용 불가 시 무시
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "복사됨" : "코드 복사"}
      className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-border bg-background/70 px-2 py-1 text-xs text-muted backdrop-blur transition-colors hover:text-foreground"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

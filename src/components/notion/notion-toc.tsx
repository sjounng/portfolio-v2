import type { NotionBlock } from "@/lib/notion";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/** 최상위 블록에서 헤딩을 추출해 목차를 만든다 (토글 헤딩 포함, 항상 보이는 항목만). */
export function collectHeadings(blocks: NotionBlock[]): TocHeading[] {
  const out: TocHeading[] = [];
  for (const b of blocks) {
    const level =
      b.type === "heading_1" ? 1 : b.type === "heading_2" ? 2 : b.type === "heading_3" ? 3 : 0;
    if (!level) continue;
    const text = (b[b.type].rich_text ?? [])
      .map((t: { plain_text: string }) => t.plain_text)
      .join("");
    if (text) out.push({ id: b.id.replace(/-/g, ""), text, level });
  }
  return out;
}

export function NotionToc({ headings }: { headings: TocHeading[] }) {
  if (headings.length < 2) return null;
  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav aria-label="목차" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">목차</p>
      <ul className="space-y-1.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - minLevel) * 0.75 + 0.875}rem` }}>
            <a
              href={`#${h.id}`}
              className="-ml-px block truncate border-l border-transparent text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import Link from "next/link";
import type { NotionListItem } from "@/lib/notion";
import { Pill } from "@/components/notion/notion-tag";

function itemUrl(id: string) {
  return `/projects/${id.replace(/-/g, "")}`;
}

function formatMonth(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "numeric" });
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start) return null;
  const from = formatMonth(start);
  if (!from) return null;
  const to = end ? formatMonth(end) : null;
  return to ? `${from} ~ ${to}` : `${from} ~`;
}

export function ProjectList({ items }: { items: NotionListItem[] }) {
  if (items.length === 0) {
    return <p className="text-muted">아직 등록된 프로젝트가 없습니다.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const period = formatPeriod(item.date, item.dateEnd);
        return (
          <Link
            key={item.id}
            href={itemUrl(item.id)}
            className="group flex flex-col gap-3 rounded-xl border border-border p-5 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold leading-snug text-foreground">
                {item.title || "제목 없음"}
              </h2>
              {item.type && (
                <span className="shrink-0">
                  <Pill tag={item.type} />
                </span>
              )}
            </div>

            {period && <p className="text-xs text-muted">{period}</p>}

            {item.summary && (
              <p className="line-clamp-3 text-sm leading-6 text-muted">
                {item.summary}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-1 pt-1">
                {item.tags.map((tag) => (
                  <Pill key={tag.name} tag={tag} />
                ))}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

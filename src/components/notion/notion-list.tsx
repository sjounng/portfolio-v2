import Link from "next/link";
import type { NotionListItem } from "@/lib/notion";
import { Pill } from "./notion-tag";

function itemUrl(id: string) {
  return `/notion/${id.replace(/-/g, "")}`;
}

function formatDate(date: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

const COLS =
  "grid grid-cols-[1fr_auto] md:grid-cols-[1fr_13rem_6rem_5rem] gap-x-3 items-center";

export function NotionList({ items }: { items: NotionListItem[] }) {
  if (items.length === 0) {
    return <p className="text-muted">아직 작성된 글이 없습니다.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {/* header */}
      <div
        className={`${COLS} border-b border-border bg-accent px-4 py-2 text-xs font-medium text-muted`}
      >
        <span>강의명</span>
        <span className="hidden md:block">유형</span>
        <span className="hidden md:block">상태</span>
        <span className="hidden md:block text-right">날짜</span>
      </div>

      {items.map((item) => {
        const date = formatDate(item.date);
        return (
          <Link
            key={item.id}
            href={itemUrl(item.id)}
            className={`${COLS} border-b border-border px-4 py-2.5 text-sm transition-colors last:border-0 hover:bg-accent`}
          >
            {/* 강의명 */}
            <span className="truncate font-medium text-foreground">
              {item.title || "제목 없음"}
            </span>

            {/* 유형 + 태그 (모바일에서는 오른쪽에 유형만) */}
            <span className="flex flex-wrap items-center justify-end gap-1 md:justify-start">
              {item.type && <Pill tag={item.type} />}
              {item.tags.map((tag) => (
                <span key={tag.name} className="hidden md:inline-block">
                  <Pill tag={tag} />
                </span>
              ))}
            </span>

            {/* 상태 */}
            <span className="hidden md:flex">
              {item.status && <Pill tag={item.status} />}
            </span>

            {/* 날짜 */}
            <span className="hidden text-right text-xs text-muted md:block">
              {date}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

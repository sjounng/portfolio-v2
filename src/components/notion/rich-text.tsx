import { Fragment } from "react";
import Link from "next/link";
import { Katex } from "./katex";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RichTextItem = any;

const LINK_CLASS =
  "text-foreground underline decoration-muted/40 underline-offset-2 transition-colors hover:decoration-foreground";

/** 노션 내부 페이지를 가리키는 링크면 포트폴리오 내부 경로로 변환, 아니면 null(외부 링크). */
function internalNotionHref(href: string | null | undefined): string | null {
  if (!href) return null;
  if (href.startsWith("/notion/")) return href;
  // 노션 내부 링크 형태:
  //   상대경로  "/<32hex>?v=...", "/<32hex>#<blockId>"
  //   절대 URL  "https://notion.so/...<32hex>..."
  if (href.startsWith("/") || /notion\.(so|site)/.test(href)) {
    const pageId = href.match(/[0-9a-f]{32}/i)?.[0]; // 첫 32hex = 페이지 id
    if (!pageId) return null;
    const anchor = href.match(/#([0-9a-f]{32})/i)?.[1]; // 블록 앵커(선택)
    return `/notion/${pageId}${anchor ? `#${anchor}` : ""}`;
  }
  return null;
}

const COLOR_MAP: Record<string, string> = {
  gray: "#6b7280",
  brown: "#92400e",
  orange: "#ea580c",
  yellow: "#ca8a04",
  green: "#16a34a",
  blue: "#2563eb",
  purple: "#9333ea",
  pink: "#db2777",
  red: "#dc2626",
};

const BG_COLOR_MAP: Record<string, string> = {
  gray_background: "#f3f4f6",
  brown_background: "#f5f0eb",
  orange_background: "#fff0e6",
  yellow_background: "#fef9c3",
  green_background: "#dcfce7",
  blue_background: "#dbeafe",
  purple_background: "#f3e8ff",
  pink_background: "#fce7f3",
  red_background: "#fee2e2",
};

function colorStyle(color: string): React.CSSProperties | undefined {
  if (!color || color === "default") return undefined;
  if (color.endsWith("_background")) {
    return { backgroundColor: BG_COLOR_MAP[color], padding: "0 0.2em", borderRadius: "3px" };
  }
  return { color: COLOR_MAP[color] };
}

export function RichText({ value }: { value: RichTextItem[] }) {
  if (!value || value.length === 0) return null;

  return (
    <>
      {value.map((item, i) => {
        const { annotations, plain_text, href } = item;

        // 인라인 수식
        if (item.type === "equation") {
          return <Katex key={i} expr={item.equation?.expression ?? plain_text} />;
        }

        // 페이지/DB 멘션 → 포트폴리오 내부 페이지로 이동
        if (item.type === "mention") {
          const m = item.mention;
          const targetId =
            m?.type === "page" ? m.page?.id : m?.type === "database" ? m.database?.id : null;
          if (targetId) {
            return (
              <Link key={i} href={`/notion/${targetId.replace(/-/g, "")}`} className={LINK_CLASS}>
                {plain_text || "페이지"}
              </Link>
            );
          }
        }

        if (!plain_text) return <Fragment key={i} />;

        let node: React.ReactNode = plain_text;

        if (annotations.code) {
          node = (
            <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {node}
            </code>
          );
        }
        if (annotations.bold) node = <strong className="font-semibold">{node}</strong>;
        if (annotations.italic) node = <em>{node}</em>;
        if (annotations.strikethrough) node = <s>{node}</s>;
        if (annotations.underline) node = <u>{node}</u>;

        const style = colorStyle(annotations.color);
        if (style) node = <span style={style}>{node}</span>;

        if (href) {
          const internal = internalNotionHref(href);
          node = internal ? (
            <Link href={internal} className={LINK_CLASS}>
              {node}
            </Link>
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {node}
            </a>
          );
        }

        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}

import Link from "next/link";
import type { NotionBlock } from "@/lib/notion";
import { RichText } from "./rich-text";
import { Katex } from "./katex";
import { CopyButton } from "./copy-button";

function blockUrl(id: string) {
  return `/notion/${id.replace(/-/g, "")}`;
}

/** 외부/파일 이미지 url 추출 */
function fileUrl(file: { type: string; external?: { url: string }; file?: { url: string } }) {
  return file.type === "external" ? file.external?.url : file.file?.url;
}

function Caption({ value }: { value: NotionBlock[] }) {
  if (!value || value.length === 0) return null;
  return (
    <figcaption className="mt-2 text-sm text-muted">
      <RichText value={value} />
    </figcaption>
  );
}

function SingleBlock({ block }: { block: NotionBlock }) {
  const { type } = block;
  const data = block[type];
  const children: NotionBlock[] = block.children ?? [];

  switch (type) {
    case "paragraph":
      if (!data.rich_text?.length) return <div className="h-4" aria-hidden />;
      return (
        <p className="my-4 leading-7 text-foreground/90">
          <RichText value={data.rich_text} />
        </p>
      );

    case "heading_1":
    case "heading_2":
    case "heading_3": {
      const anchor = block.id.replace(/-/g, "");
      const size: Record<string, string> = {
        heading_1: "text-3xl font-bold tracking-tight",
        heading_2: "text-2xl font-bold tracking-tight",
        heading_3: "text-xl font-semibold tracking-tight",
      };
      const margin: Record<string, string> = {
        heading_1: "mt-10 mb-4",
        heading_2: "mt-8 mb-3",
        heading_3: "mt-6 mb-2",
      };
      const Tag = (type === "heading_1" ? "h2" : type === "heading_2" ? "h3" : "h4") as "h2";

      // 토글 헤딩: 펼치면 자식 블록이 보인다
      if (data.is_toggleable && children.length > 0) {
        return (
          <details className={`group ${margin[type]}`}>
            <summary className="flex cursor-pointer list-none items-center gap-2">
              <span className="text-sm text-muted transition-transform group-open:rotate-90">▶</span>
              <Tag id={anchor} className={`scroll-mt-24 ${size[type]}`}>
                <RichText value={data.rich_text} />
              </Tag>
            </summary>
            <div className="ml-6 mt-3 border-l border-border pl-4">
              <NotionBlocks blocks={children} />
            </div>
          </details>
        );
      }
      return (
        <Tag id={anchor} className={`scroll-mt-24 ${margin[type]} ${size[type]}`}>
          <RichText value={data.rich_text} />
        </Tag>
      );
    }

    case "to_do":
      return (
        <div className="my-1.5 flex items-start gap-2">
          <input type="checkbox" checked={data.checked} readOnly className="mt-1.5 accent-foreground" />
          <span className={data.checked ? "text-muted line-through" : "text-foreground/90"}>
            <RichText value={data.rich_text} />
          </span>
        </div>
      );

    case "toggle":
      return (
        <details className="my-2 rounded-lg border border-border px-4 py-2">
          <summary className="cursor-pointer font-medium text-foreground/90">
            <RichText value={data.rich_text} />
          </summary>
          <div className="mt-2">
            <NotionBlocks blocks={children} />
          </div>
        </details>
      );

    case "quote":
      return (
        <blockquote className="my-4 border-l-4 border-foreground/30 pl-4 italic text-foreground/80">
          <RichText value={data.rich_text} />
          {children.length > 0 && <NotionBlocks blocks={children} />}
        </blockquote>
      );

    case "callout":
      return (
        <div
          className="notion-callout my-4 flex gap-3 rounded-lg p-4"
          data-color={data.color || "default"}
        >
          {data.icon?.emoji && <span className="text-xl leading-7">{data.icon.emoji}</span>}
          <div className="flex-1 text-foreground/90">
            <RichText value={data.rich_text} />
            {children.length > 0 && <NotionBlocks blocks={children} />}
          </div>
        </div>
      );

    case "code": {
      const codeText = data.rich_text?.map((t: NotionBlock) => t.plain_text).join("") ?? "";
      const lang: string = data.language ?? "";
      return (
        <div className="notion-code group relative my-4 overflow-hidden rounded-lg border border-border text-sm leading-6">
          <CopyButton text={codeText} />
          {lang && lang !== "plain text" && (
            <div className="border-b border-border px-4 py-1.5 font-mono text-xs text-muted">
              {lang}
            </div>
          )}
          {block.highlightedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: block.highlightedHtml }} />
          ) : (
            <pre className="overflow-x-auto p-4">
              <code className="font-mono text-foreground/90">{codeText}</code>
            </pre>
          )}
        </div>
      );
    }

    case "divider":
      return <hr className="my-8 border-border" />;

    case "image": {
      const url = fileUrl(data);
      if (!url) return null;
      return (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="mx-auto rounded-lg" loading="lazy" />
          <Caption value={data.caption} />
        </figure>
      );
    }

    case "bookmark":
    case "embed": {
      const url = data.url;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 block truncate rounded-lg border border-border px-4 py-3 text-sm text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          {url}
        </a>
      );
    }

    case "video": {
      const url = fileUrl(data);
      if (!url) return null;
      return (
        <figure className="my-6">
          <video src={url} controls className="mx-auto w-full rounded-lg" />
          <Caption value={data.caption} />
        </figure>
      );
    }

    case "child_page":
      return (
        <Link
          href={blockUrl(block.id)}
          className="my-2 flex items-center gap-2 rounded-lg border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent"
        >
          <span aria-hidden>📄</span>
          {data.title}
        </Link>
      );

    case "link_to_page": {
      const targetId = data.page_id ?? data.database_id;
      if (!targetId) return null;
      return (
        <Link
          href={blockUrl(targetId)}
          className="my-2 flex items-center gap-2 rounded-lg border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent"
        >
          <span aria-hidden>↗</span>
          {block.linkedTitle || "페이지 열기"}
        </Link>
      );
    }

    case "child_database":
      return (
        <Link
          href={blockUrl(block.id)}
          className="my-2 flex items-center gap-2 rounded-lg border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-accent"
        >
          <span aria-hidden>🗂️</span>
          {data.title || "Database"}
        </Link>
      );

    case "column_list":
      return (
        <div className="my-4 flex flex-col gap-4 md:flex-row">
          {children.map((col) => (
            <div key={col.id} className="flex-1">
              <NotionBlocks blocks={col.children ?? []} />
            </div>
          ))}
        </div>
      );

    case "table":
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {children.map((row, ri) => (
                <tr key={row.id} className="border-b border-border">
                  {row.table_row?.cells?.map((cell: NotionBlock[], ci: number) => {
                    const Cell = ri === 0 && data.has_column_header ? "th" : "td";
                    return (
                      <Cell key={ci} className="px-3 py-2 text-left align-top">
                        <RichText value={cell} />
                      </Cell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "equation":
      return <Katex expr={data.expression} block />;

    default:
      // 미지원 블록은 자식만 렌더 (column 등) 하거나 조용히 무시
      if (children.length > 0) return <NotionBlocks blocks={children} />;
      return null;
  }
}

/**
 * 블록 배열을 렌더한다.
 * 연속된 목록 아이템(bulleted/numbered)을 묶어 ul/ol 로 출력한다.
 */
export function NotionBlocks({ blocks }: { blocks: NotionBlock[] }) {
  const out: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const type = block.type;

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const ordered = type === "numbered_list_item";
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === type) {
        items.push(blocks[i]);
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      out.push(
        <ListTag
          key={block.id}
          className={`my-4 space-y-1.5 pl-6 ${ordered ? "list-decimal" : "list-disc"} marker:text-muted`}
        >
          {items.map((item) => (
            <li key={item.id} className="leading-7 text-foreground/90">
              <RichText value={item[item.type].rich_text} />
              {item.children?.length > 0 && <NotionBlocks blocks={item.children} />}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    out.push(<SingleBlock key={block.id} block={block} />);
    i++;
  }

  return <>{out}</>;
}

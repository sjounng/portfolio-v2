import type { NotionTag } from "@/lib/notion";

export function Pill({ tag }: { tag: NotionTag }) {
  return (
    <span
      className="notion-pill inline-block max-w-full truncate rounded px-1.5 py-0.5 text-xs font-medium leading-5"
      data-color={tag.color || "default"}
    >
      {tag.name}
    </span>
  );
}

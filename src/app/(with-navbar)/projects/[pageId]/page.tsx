import { getNotionPage } from "@/lib/notion";
import { NotionBlocks } from "@/components/notion/notion-blocks";
import { NotionToc, collectHeadings } from "@/components/notion/notion-toc";
import NotionShell from "../../notion/notion-shell";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ pageId: string }>;
}

export default async function ProjectSubPage({ params }: PageProps) {
  const { pageId } = await params;
  const { title, blocks } = await getNotionPage(pageId);

  if (blocks.length === 0) {
    return (
      <NotionShell>
        <p className="text-muted">프로젝트 페이지를 불러올 수 없습니다.</p>
      </NotionShell>
    );
  }

  const headings = collectHeadings(blocks);

  return (
    <NotionShell
      title={title}
      toc={headings.length >= 2 ? <NotionToc headings={headings} /> : undefined}
    >
      <NotionBlocks blocks={blocks} />
    </NotionShell>
  );
}

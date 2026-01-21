import { getNotionPage } from "@/lib/notion";
import NotionPageClient from "../notion-client";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ pageId: string }>;
}

export default async function NotionSubPage({ params }: PageProps) {
  const { pageId } = await params;
  const recordMap = await getNotionPage(pageId);

  return <NotionPageClient recordMap={recordMap} rootPageId={pageId} />;
}

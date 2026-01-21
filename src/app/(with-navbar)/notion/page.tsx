import { getNotionPage, NOTION_PAGE_ID } from "@/lib/notion";
import NotionPageClient from "./notion-client";

export const revalidate = 3600;

export default async function NotionPage() {
  const recordMap = await getNotionPage(NOTION_PAGE_ID);

  return <NotionPageClient recordMap={recordMap} />;
}

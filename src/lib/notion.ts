import { NotionAPI } from "notion-client";

const notion = new NotionAPI();

export async function getNotionPage(pageId: string) {
  const recordMap = await notion.getPage(pageId);
  return recordMap;
}

export const NOTION_PAGE_ID = "1cc803ffd83080a3a2e2c6ffccbd79ec";

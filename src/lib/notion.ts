import { NotionAPI } from "notion-client";

const notion = new NotionAPI();

export async function getNotionPage(pageId: string) {
  const recordMap = await notion.getPage(pageId);

  // Notion API now returns some records wrapped in an extra { value, role } layer.
  // Normalize so react-notion-x can access .value.type / .value.schema directly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const map of [recordMap.block, recordMap.collection] as any[]) {
    for (const [key, entry] of Object.entries(map)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (entry as any)?.value;
      if (val && val.value && val.role && !val.type && !val.id) {
        map[key] = { ...(entry as object), value: val.value };
      }
    }
  }

  return recordMap;
}

export const NOTION_PAGE_ID = "1cc803ffd83080a3a2e2c6ffccbd79ec";

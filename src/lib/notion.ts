import { Client, isFullBlock, isFullPage } from "@notionhq/client";
import { highlightCode } from "./highlight";

/**
 * 공식 Notion API 클라이언트.
 *
 * 사용하려면 .env.local 에 NOTION_TOKEN 을 설정하고,
 * 노션에서 해당 페이지를 인티그레이션에 "연결"해야 합니다.
 * (https://www.notion.so/my-integrations 에서 internal integration 생성)
 */
const notion = new Client({ auth: process.env.NOTION_TOKEN });

// 노출할 노션 데이터베이스 id ("알고리즘, CS 정리"). env 로 덮어쓸 수 있음.
export const NOTION_DATABASE_ID =
  process.env.NOTION_DATABASE_ID || "1cc803ffd83080a3a2e2c6ffccbd79ec";

// 프로젝트 케이스 스터디 데이터베이스 id. 미설정 시 /projects 는 빈 목록을 보여준다.
export const NOTION_PROJECTS_DATABASE_ID =
  process.env.NOTION_PROJECTS_DATABASE_ID || "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotionBlock = any & { children?: NotionBlock[] };

/** 대시 없는 32자 id 를 표준 UUID 형태로 변환 (공식 API 는 둘 다 허용하지만 안전하게 정규화). */
export function normalizeId(id: string): string {
  const clean = id.replace(/-/g, "");
  if (clean.length !== 32) return id;
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

/** 한 블록의 모든 자식을 페이지네이션 처리하며 가져온다. */
async function listChildren(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of res.results) {
      if (isFullBlock(block)) blocks.push(block);
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

/**
 * 페이지(또는 블록)의 모든 자식 블록을 재귀적으로 가져온다.
 * 자식이 있는 블록은 `children` 배열에 중첩되어 채워진다.
 */
export async function getBlocks(blockId: string): Promise<NotionBlock[]> {
  const blocks = await listChildren(normalizeId(blockId));

  await Promise.all(
    blocks.map(async (block) => {
      // child_page / child_database 는 별도 페이지로 라우팅하므로 펼치지 않는다.
      if (
        block.has_children &&
        block.type !== "child_page" &&
        block.type !== "child_database"
      ) {
        block.children = await getBlocks(block.id);
      }

      // link_to_page 블록: 대상 페이지 제목을 미리 가져와 라벨로 사용
      if (block.type === "link_to_page") {
        const lp = block.link_to_page;
        const targetId = lp?.page_id ?? lp?.database_id;
        if (targetId) block.linkedTitle = await getPageTitle(targetId);
      }

      // code 블록: 서버에서 문법 하이라이팅 HTML 을 미리 생성
      if (block.type === "code") {
        const text =
          block.code.rich_text?.map((t: { plain_text: string }) => t.plain_text).join("") ?? "";
        block.highlightedHtml = await highlightCode(text, block.code.language ?? "text");
      }
    })
  );

  return blocks;
}

/** 페이지 제목을 추출한다. */
export async function getPageTitle(pageId: string): Promise<string> {
  try {
    const page = await notion.pages.retrieve({ page_id: normalizeId(pageId) });
    if (!isFullPage(page)) return "";

    for (const prop of Object.values(page.properties)) {
      if (prop.type === "title") {
        return prop.title.map((t) => t.plain_text).join("");
      }
    }
  } catch {
    // 데이터베이스이거나 권한이 없는 경우 등
  }
  return "";
}

export interface NotionTag {
  name: string;
  color: string;
}

export interface NotionListItem {
  id: string;
  title: string;
  date: string | null;
  /** date 속성의 종료일 (기간 표시용) */
  dateEnd: string | null;
  /** 첫 번째 rich_text 속성 (프로젝트 카드 요약용) */
  summary: string | null;
  type: NotionTag | null;
  status: NotionTag | null;
  tags: NotionTag[];
  order: number | null;
}

// 수동 정렬을 재현하기 위한 숫자 속성 이름들 (노션에 이 이름으로 number 속성 추가)
const ORDER_PROP_NAMES = new Set(["순서", "정렬", "order", "Order", "Sort", "sort"]);

export interface NotionDatabase {
  title: string;
  items: NotionListItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readProps(properties: Record<string, any>) {
  let title = "";
  let date: string | null = null;
  let dateEnd: string | null = null;
  let summary: string | null = null;
  let type: NotionTag | null = null;
  let status: NotionTag | null = null;
  let order: number | null = null;
  const tags: NotionTag[] = [];

  for (const [name, prop] of Object.entries(properties)) {
    if (prop.type === "number" && ORDER_PROP_NAMES.has(name) && prop.number != null) {
      order = prop.number;
      continue;
    }
    switch (prop.type) {
      case "title":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title = prop.title.map((t: any) => t.plain_text).join("");
        break;
      case "date":
        if (prop.date?.start && !date) {
          date = prop.date.start;
          dateEnd = prop.date.end ?? null;
        }
        break;
      case "rich_text":
        if (!summary) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const text = prop.rich_text.map((t: any) => t.plain_text).join("");
          if (text) summary = text;
        }
        break;
      case "created_time":
        if (!date) date = prop.created_time;
        break;
      case "select":
        if (!type && prop.select) type = { name: prop.select.name, color: prop.select.color };
        break;
      case "status":
        if (!status && prop.status) status = { name: prop.status.name, color: prop.status.color };
        break;
      case "multi_select":
        for (const s of prop.multi_select) tags.push({ name: s.name, color: s.color });
        break;
    }
  }
  return { title, date, dateEnd, summary, type, status, tags, order };
}

/** 데이터베이스의 글 목록을 가져온다 (작성일 내림차순). 실패 시 빈 결과. */
export async function getDatabaseItems(
  databaseId: string = NOTION_DATABASE_ID
): Promise<NotionDatabase> {
  try {
    // 컨테이너 DB → data source 해석 (API 2025-09-03)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = await notion.databases.retrieve({
      database_id: normalizeId(databaseId),
    });
    const dataSourceId = db.data_sources?.[0]?.id;
    const dbTitle = (db.title ?? []).map((t: { plain_text: string }) => t.plain_text).join("");
    if (!dataSourceId) return { title: dbTitle, items: [] };

    const items: NotionListItem[] = [];
    let cursor: string | undefined;
    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await notion.dataSources.query({
        data_source_id: dataSourceId,
        start_cursor: cursor,
        page_size: 100,
      });
      for (const row of res.results) {
        if (!row.properties) continue;
        items.push({ id: row.id, ...readProps(row.properties) });
      }
      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
    } while (cursor);

    // "순서" 숫자 속성이 있으면 그 값으로 오름차순 정렬 (수동 정렬 재현용).
    // 없으면 노션 데이터소스 기본 순서를 그대로 사용.
    if (items.some((it) => it.order != null)) {
      items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    }
    return { title: dbTitle, items };
  } catch (err) {
    console.error("[notion] failed to load database", databaseId, err);
    return { title: "", items: [] };
  }
}

export interface NotionPageData {
  title: string;
  blocks: NotionBlock[];
}

/** 페이지 제목 + 블록을 한 번에 가져온다. 실패해도 throw 하지 않고 빈 결과를 돌려준다. */
export async function getNotionPage(pageId: string): Promise<NotionPageData> {
  try {
    const [title, blocks] = await Promise.all([
      getPageTitle(pageId),
      getBlocks(pageId),
    ]);
    return { title, blocks };
  } catch (err) {
    console.error("[notion] failed to load page", pageId, err);
    return { title: "", blocks: [] };
  }
}

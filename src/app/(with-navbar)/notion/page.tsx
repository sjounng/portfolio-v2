import { getDatabaseItems } from "@/lib/notion";
import { NotionList } from "@/components/notion/notion-list";
import NotionShell from "./notion-shell";

export const revalidate = 3600;

export default async function NotionPage() {
  const { title, items } = await getDatabaseItems();

  return (
    <NotionShell title={title || "Notion"} wide>
      <NotionList items={items} />
    </NotionShell>
  );
}

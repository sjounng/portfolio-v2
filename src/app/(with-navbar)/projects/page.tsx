import { getDatabaseItems, NOTION_PROJECTS_DATABASE_ID } from "@/lib/notion";
import { ProjectList } from "@/components/projects/project-list";
import NotionShell from "../notion/notion-shell";

export const revalidate = 3600;

export default async function ProjectsPage() {
  const { title, items } = NOTION_PROJECTS_DATABASE_ID
    ? await getDatabaseItems(NOTION_PROJECTS_DATABASE_ID)
    : { title: "", items: [] };

  return (
    <NotionShell title={title || "Projects"} wide>
      <ProjectList items={items} />
    </NotionShell>
  );
}

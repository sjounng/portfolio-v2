import type { Project } from "@/types/info";
import { isUrl } from "@/lib/utils";

interface ProjectItemProps {
  project: Project;
}

export function ProjectItem({ project }: ProjectItemProps) {
  return (
    <div className="border-l-2 border-border pl-4">
      <div className="text-lg font-medium">{project.title}</div>
      <div className="text-base text-muted mb-2">{project.period}</div>
      {project.details && (
        <ul className="text-base text-muted space-y-1">
          {project.details.map((detail) => (
            <li key={detail}>
              {isUrl(detail) ? (
                <a
                  href={detail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {detail}
                </a>
              ) : (
                `• ${detail}`
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

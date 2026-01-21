import type { TechStackCategory } from "@/types/info";
import { TechBadge } from "@/components/ui/tech-badge";

interface TechStackSectionProps {
  category: TechStackCategory;
}

export function TechStackSection({ category }: TechStackSectionProps) {
  return (
    <div>
      <h3 className="text-base font-medium text-muted mb-3">{category.title}</h3>
      <div className="flex flex-wrap gap-2">
        {category.badges.map((badge) => (
          <TechBadge key={badge.name} badge={badge} />
        ))}
      </div>
    </div>
  );
}

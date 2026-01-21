import type { Education } from "@/types/info";

interface EducationItemProps {
  education: Education;
}

export function EducationItem({ education }: EducationItemProps) {
  return (
    <div className="border-l-2 border-border pl-4">
      <div className="text-lg font-medium">{education.school}</div>
      <div className="text-base text-muted">
        {education.status} | {education.period}
      </div>
    </div>
  );
}

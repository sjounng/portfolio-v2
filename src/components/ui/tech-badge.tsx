import Image from "next/image";
import type { TechBadge as TechBadgeType } from "@/types/info";
import { createBadgeUrl } from "@/lib/utils";

interface TechBadgeProps {
  badge: TechBadgeType;
}

export function TechBadge({ badge }: TechBadgeProps) {
  return (
    <Image
      src={createBadgeUrl(badge)}
      alt={badge.name}
      width={120}
      height={28}
      className="h-7 w-auto"
      unoptimized
    />
  );
}

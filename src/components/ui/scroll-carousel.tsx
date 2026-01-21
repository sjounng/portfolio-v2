"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollCarouselProps {
  children: ReactNode[];
}

export function ScrollCarousel({ children }: ScrollCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const totalSections = children.length;

  return (
    <div
      ref={containerRef}
      className="snap-y snap-mandatory overflow-y-auto h-screen"
      style={{ scrollBehavior: "smooth" }}
    >
      {children.map((child, index) => (
        <div
          key={index}
          className="snap-start h-screen flex items-center justify-center overflow-hidden"
        >
          <div
            className="relative w-full max-w-4xl px-6"
            style={{ perspective: "1200px" }}
          >
            <CarouselItem
              index={index}
              total={totalSections}
              progress={scrollYProgress}
            >
              {child}
            </CarouselItem>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CarouselItemProps {
  children: ReactNode;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}

function CarouselItem({ children, index, total, progress }: CarouselItemProps) {
  const sectionSize = 1 / total;
  const start = index * sectionSize;
  const center = start + sectionSize * 0.5;
  const end = (index + 1) * sectionSize;

  const opacity = useTransform(
    progress,
    [start, start + sectionSize * 0.2, end - sectionSize * 0.2, end],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    progress,
    [start, center, end],
    ["30%", "0%", "-30%"]
  );

  const rotateX = useTransform(
    progress,
    [start, center, end],
    [20, 0, -20]
  );

  const scale = useTransform(
    progress,
    [start, center, end],
    [0.9, 1, 0.9]
  );

  return (
    <motion.div
      className="w-full"
      style={{
        opacity,
        y,
        rotateX,
        scale,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

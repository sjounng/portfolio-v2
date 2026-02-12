"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePage } from "@/context/page-context";

interface FullpageScrollProps {
  children: ReactNode[];
}

export function FullpageScroll({ children }: FullpageScrollProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFirstMount, setIsFirstMount] = useState(true);
  const isAnimatingRef = useRef(false);
  const lastWheelTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const totalSections = children.length;
  const { setCurrentPage } = usePage();

  const WHEEL_COOLDOWN = 800;

  const goToSection = (index: number, dir: number) => {
    if (isAnimatingRef.current) return;
    if (index < 0 || index >= totalSections) return;
    if (index === currentIndex) return;

    isAnimatingRef.current = true;
    setDirection(dir);
    setCurrentIndex(index);
    setCurrentPage(index);
  };

  const handleAnimationComplete = () => {
    isAnimatingRef.current = false;
    if (isFirstMount) {
      setIsFirstMount(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [setCurrentPage]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastWheelTimeRef.current < WHEEL_COOLDOWN) return;
      if (isAnimatingRef.current) return;

      if (Math.abs(e.deltaY) < 30) return;

      lastWheelTimeRef.current = now;

      if (e.deltaY > 0) {
        goToSection(currentIndex + 1, 1);
      } else if (e.deltaY < 0) {
        goToSection(currentIndex - 1, -1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimatingRef.current) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToSection(currentIndex + 1, 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToSection(currentIndex - 1, -1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;

      const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 50) return;

      if (deltaY > 0) {
        goToSection(currentIndex + 1, 1);
      } else {
        goToSection(currentIndex - 1, -1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, totalSections]);

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      y: "0%",
      opacity: 1,
    },
    exit: (dir: number) => ({
      y: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const isFirstPage = currentIndex === 0;
  const isLastPage = currentIndex === totalSections - 1;

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Sections */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial={isFirstMount ? { opacity: 0, y: 40 } : "enter"}
          animate="center"
          exit="exit"
          transition={{
            duration: 0.7,
            ease: [0.76, 0, 0.24, 1],
          }}
          onAnimationComplete={handleAnimationComplete}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-full max-w-4xl px-6 pt-4 md:pt-16">{children[currentIndex]}</div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSection(index, index > currentIndex ? 1 : -1)}
            className="w-3 h-3 rounded-full cursor-pointer bg-muted hover:bg-foreground/50"
            aria-label={`섹션 ${index + 1}로 이동`}
          />
        ))}
        {/* Active Dot Indicator */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-foreground pointer-events-none"
          animate={{
            y: currentIndex * 24,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        />
      </div>

      {/* Section Counter */}
      <div className="fixed bottom-8 left-8 text-sm text-muted z-50">
        <span className="text-foreground font-medium">
          {String(currentIndex + 1).padStart(2, "0")}
        </span>
        <span className="mx-2">/</span>
        <span>{String(totalSections).padStart(2, "0")}</span>
      </div>

      {/* Scroll Down Button - 첫 페이지에서만 표시 */}
      <AnimatePresence>
        {isFirstPage && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 0.6,
              y: [0, 10, 0],
            }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0, transition: { duration: 0.2, repeat: 0 } }}
            transition={{
              opacity: { duration: 0.3 },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onClick={() => goToSection(1, 1)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-foreground/50 text-background flex items-center justify-center z-50 hover:scale-110 transition-transform backdrop-blur-sm"
            aria-label="아래로 스크롤"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Go to Top Button - 마지막 페이지에서만 표시 */}
      <AnimatePresence>
        {isLastPage && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 0.6,
              y: [0, -10, 0],
            }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ opacity: 1, y: 0, transition: { duration: 0.2, repeat: 0 } }}
            transition={{
              opacity: { duration: 0.3 },
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            onClick={() => goToSection(0, -1)}
            className="fixed top-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-foreground/50 text-background flex items-center justify-center z-50 hover:scale-110 transition-transform backdrop-blur-sm"
            aria-label="맨 위로 이동"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

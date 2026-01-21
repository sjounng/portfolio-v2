"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { usePage } from "@/context/page-context";

const TOTAL_PAGES = 4;

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const { currentPage } = usePage();

  const isLastPage = currentPage === TOTAL_PAGES - 1;

  useEffect(() => {
    // 타이머 콜백 내에서 setState를 호출하여 동기적 호출 방지
    const timer = setTimeout(
      () => {
        setIsVisible(isLastPage);
      },
      isLastPage ? 1000 : 0
    );
    return () => clearTimeout(timer);
  }, [isLastPage]);

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : 100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 py-6 px-6 bg-background/80 backdrop-blur-sm border-t border-border"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-base text-muted">
            <p>Seoul, South Korea</p>
            <p>jwsong5160@gmail.com</p>
          </div>
          <p className="text-base text-muted">
            &copy; {new Date().getFullYear()} Junwoo Song
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

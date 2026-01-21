"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "../theme-toggle";
import { usePage } from "@/context/page-context";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/info", label: "Info" },
  { href: "/notion", label: "Notion" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { currentPage } = usePage();

  useEffect(() => {
    // 타이머 콜백 내에서 setState를 호출하여 동기적 호출 방지
    const timer = setTimeout(
      () => {
        setIsVisible(currentPage === 0);
      },
      currentPage === 0 ? 1000 : 0
    );
    return () => clearTimeout(timer);
  }, [currentPage]);

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border"
    >
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          June
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base text-muted hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/sjounng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="메뉴 열기"
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
            {isOpen ? (
              <>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </>
            ) : (
              <>
                <path d="M4 12h16" />
                <path d="M4 6h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base text-muted hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/sjounng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-muted hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              GitHub
            </a>
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </motion.header>
  );
}

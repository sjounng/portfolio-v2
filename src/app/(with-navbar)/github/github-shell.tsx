"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function GitHubShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen pt-32 md:pt-40 pb-12 flex flex-col"
    >
      <div className="mx-auto w-full max-w-5xl flex-1 px-6">{children}</div>

      <footer className="mt-12 border-t border-border bg-accent px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-base text-foreground/70">
            <p>Seoul, South Korea</p>
            <p>jwsong5160@gmail.com</p>
          </div>
          <p className="text-base text-foreground/70">
            &copy; {new Date().getFullYear()} Junwoo Song
          </p>
        </div>
      </footer>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function NotionShell({
  title,
  children,
  wide = false,
  toc,
}: {
  title?: string;
  children: ReactNode;
  wide?: boolean;
  toc?: ReactNode;
}) {
  const maxWidth = wide ? "max-w-5xl" : "max-w-3xl";
  const footerWidth = toc ? "max-w-6xl" : maxWidth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen pt-32 md:pt-40 pb-12 flex flex-col"
    >
      {toc ? (
        <div className="mx-auto w-full max-w-6xl flex-1 px-6 lg:grid lg:grid-cols-[1fr_15rem] lg:gap-12">
          <article className="min-w-0 max-w-3xl">
            {title && <h1 className="mb-8 text-4xl font-bold tracking-tight">{title}</h1>}
            <div className="mb-8 rounded-lg border border-border p-4 lg:hidden">{toc}</div>
            {children}
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">{toc}</div>
          </aside>
        </div>
      ) : (
        <article className={`mx-auto w-full ${maxWidth} flex-1 px-6`}>
          {title && <h1 className="mb-8 text-4xl font-bold tracking-tight">{title}</h1>}
          {children}
        </article>
      )}

      <footer className="mt-12 border-t border-border bg-accent px-6 py-6">
        <div className={`mx-auto flex ${footerWidth} flex-col items-center justify-between gap-4 md:flex-row`}>
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

"use client";

import dynamic from "next/dynamic";
import type { ExtendedRecordMap } from "notion-types";
import { motion } from "framer-motion";
import { Component, useEffect, type ReactNode } from "react";

const NotionRenderer = dynamic(
  () => import("react-notion-x").then((mod) => mod.NotionRenderer),
  { ssr: false }
);

const CollectionBase = dynamic(
  () => import("react-notion-x/build/third-party/collection").then((mod) => mod.Collection),
  { ssr: false }
);

class NotionErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="p-4 text-sm text-muted">콘텐츠를 불러올 수 없습니다.</div>;
    }
    return this.props.children;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Collection(props: any) {
  return (
    <NotionErrorBoundary>
      <CollectionBase {...props} />
    </NotionErrorBoundary>
  );
}

interface NotionPageClientProps {
  recordMap: ExtendedRecordMap;
  rootPageId?: string;
}

export default function NotionPageClient({ recordMap, rootPageId }: NotionPageClientProps) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/react-notion-x@7.7.3/src/styles.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (!recordMap || Object.keys(recordMap.block || {}).length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <p className="text-muted">노션 페이지를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const mapPageUrl = (pageId: string) => {
    return `/notion/${pageId.replace(/-/g, "")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen pt-24 pb-12 flex flex-col"
    >
      <div className="w-full px-6 flex-1">
        <NotionErrorBoundary
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <p className="text-muted">노션 페이지를 렌더링할 수 없습니다.</p>
            </div>
          }
        >
          <NotionRenderer
            recordMap={recordMap}
            fullPage={false}
            darkMode={false}
            disableHeader={true}
            rootPageId={rootPageId}
            mapPageUrl={mapPageUrl}
            components={{
              Collection
            }}
          />
        </NotionErrorBoundary>
      </div>
      <footer className="py-6 px-6 border-t border-border mt-12 bg-accent">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
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

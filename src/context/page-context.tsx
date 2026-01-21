"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface PageContextType {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PageContext = createContext<PageContextType>({
  currentPage: 0,
  setCurrentPage: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
}

export const usePage = () => useContext(PageContext);

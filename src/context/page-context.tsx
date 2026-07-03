"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface PageContextType {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  navbarHidden: boolean;
  setNavbarHidden: (hidden: boolean) => void;
}

const PageContext = createContext<PageContextType>({
  currentPage: 0,
  setCurrentPage: () => {},
  navbarHidden: false,
  setNavbarHidden: () => {},
});

export function PageProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [navbarHidden, setNavbarHidden] = useState(false);

  return (
    <PageContext.Provider
      value={{ currentPage, setCurrentPage, navbarHidden, setNavbarHidden }}
    >
      {children}
    </PageContext.Provider>
  );
}

export const usePage = () => useContext(PageContext);

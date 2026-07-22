"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  activeBranchId: string | "all";
  setActiveBranch: (id: string | "all") => void;
  aiPaused: boolean;
  toggleAI: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      commandOpen: false,
      setCommandOpen: (open) => set({ commandOpen: open }),
      activeBranchId: "all",
      setActiveBranch: (id) => set({ activeBranchId: id }),
      aiPaused: false,
      toggleAI: () => set((s) => ({ aiPaused: !s.aiPaused })),
    }),
    { name: "netics-ui" }
  )
);

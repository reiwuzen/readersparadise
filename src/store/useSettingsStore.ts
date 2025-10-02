import { create } from "zustand";

type SettingsState = {
  theme: "light" | "dark" | "system" | "custom";
  setTheme: (theme: "light" | "dark" | "system" | "custom") => void;

  // Example: reader defaults
  defaultViewMode: "cover" | "contain" | "fill" | "none";
  setDefaultViewMode: (mode: "cover" | "contain" | "fill" | "none") => void;

  // NSFW toggle
  showNSFW: boolean;
  toggleNSFW: () => void;

  // storage path
  libraryPath: string;
  setLibraryPath: (path: string) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  setTheme: (theme) => set({ theme }),

  defaultViewMode: "contain",
  setDefaultViewMode: (mode) => set({ defaultViewMode: mode }),

  showNSFW: false,
  toggleNSFW: () => set((state) => ({ showNSFW: !state.showNSFW })),

  libraryPath: "",
  setLibraryPath: (path) => set({ libraryPath: path }),
}));

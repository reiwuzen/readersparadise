import { create } from "zustand";

import GeneralSettings from "@/components/tabs/settingsTab/components/GeneralSettings/GeneralSettings";
import StorageSettings from "@/components/tabs/settingsTab/components/StorageSettings/StorageSettings";
import SourcesSettings from "@/components/tabs/settingsTab/components/SourcesSettings/SourcesSettings";
import AccountSettings from "@/components/tabs/settingsTab/components/AccountSettings/AccountSettings";
import ReaderSettings from "@/components/tabs/settingsTab/components/ReaderSettings/ReaderSettings";
import NetworkSettings from "@/components/tabs/settingsTab/components/NetworkSettings/NetworkSettings";
import DeveloperSettings from "@/components/tabs/settingsTab/components/DeveloperSettings/DeveloperSettings";
import PrivacySettings from "@/components/tabs/settingsTab/components/PrivacySettings/PrivacySettings";
import BackupSettings from "@/components/tabs/settingsTab/components/BackupSettings/BackupSettings";
import AdvancedSettings from "@/components/tabs/settingsTab/components/AdvancedSettings/AdvancedSettings";

// ---- Types ---- //
export type SettingsItemName =
  | "General"
  | "Storage"
  | "Sources"
  | "Account/Sync"
  | "Reader"
  | "Network"
  | "Developer"
  | "Privacy/Security"
  | "Backup And Restore"
  | "Advanced";

export type ItemId = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type themeType = "light" | "dark" | "system" | "custom" | 'blueGray' ;
export type SettingsItem = {
  title: SettingsItemName;
  content: React.ComponentType<any>;
  isItemActive: boolean;
  itemId: ItemId;
};

export type SettingsState = {
  items: SettingsItem[];
  setItemActive: (itemId: ItemId) => void;

  theme: themeType;
  setTheme: (theme: themeType) => void;
  initTheme: () => void;

  defaultViewMode: "cover" | "contain" | "fill" | "none";
  setDefaultViewMode: (mode: "cover" | "contain" | "fill" | "none") => void;

  showNSFW: boolean;
  toggleNSFW: () => void;

  libraryPath: string;
  setLibraryPath: (path: string) => void;
};

// ---- Component Map ---- //
const SETTINGS_ITEMS_COMPONENTS: Record<
  SettingsItemName,
  React.ComponentType<any>
> = {
  General: GeneralSettings,
  Storage: StorageSettings,
  Sources: SourcesSettings,
  "Account/Sync": AccountSettings,
  Reader: ReaderSettings,
  Network: NetworkSettings,
  Developer: DeveloperSettings,
  "Privacy/Security": PrivacySettings,
  "Backup And Restore": BackupSettings,
  Advanced: AdvancedSettings,
};

// ---- Zustand Store ---- //
export const useSettingsStore = create<SettingsState>((set) => ({
  items: Object.entries(SETTINGS_ITEMS_COMPONENTS).map(
    ([title, content], index) => ({
      title: title as SettingsItemName,
      content,
      isItemActive: index === 0,
      itemId: String(index) as ItemId,
    })
  ),

  setItemActive: (itemId) =>
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        isItemActive: item.itemId === itemId,
      })),
    })),

  theme: "dark",
  
  setTheme: (theme) => {
    // 1. Update the store
    set({ theme });

    // 2. Apply theme to the DOM
    document.body.className = ``;
    document.body.classList.add(theme);

    // 3. Optionally persist it
    localStorage.setItem("theme", theme);
  },
    initTheme: () => {
    const saved = localStorage.getItem("theme") as themeType | null;

    const preferred: themeType =
      saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    set({ theme: preferred });

    // Apply the preferred theme
    const applied =
      preferred === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : preferred === "custom"
        ? "light" // change this later when custom themes are implemented
        : preferred;

    document.body.classList.add(applied);
  },

  defaultViewMode: "contain",
  setDefaultViewMode: (mode) => set({ defaultViewMode: mode }),

  showNSFW: false,
  toggleNSFW: () => set((state) => ({ showNSFW: !state.showNSFW })),

  libraryPath: "",
  setLibraryPath: (path) => set({ libraryPath: path }),
}));

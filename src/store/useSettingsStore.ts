import { create } from "zustand";

import GeneralSettings from "@/pages/home/tabs/settingsTab/components/GeneralSettings/GeneralSettings";
import StorageSettings from "@/pages/home/tabs/settingsTab/components/StorageSettings/StorageSettings";
import SourcesSettings from "@/pages/home/tabs/settingsTab/components/SourcesSettings/SourcesSettings";
import AccountSettings from "@/pages/home/tabs/settingsTab/components/AccountSettings/AccountSettings";
import ReaderSettings from "@/pages/home/tabs/settingsTab/components/ReaderSettings/ReaderSettings";
import NetworkSettings from "@/pages/home/tabs/settingsTab/components/NetworkSettings/NetworkSettings";
import DeveloperSettings from "@/pages/home/tabs/settingsTab/components/DeveloperSettings/DeveloperSettings";
import PrivacySettings from "@/pages/home/tabs/settingsTab/components/PrivacySettings/PrivacySettings";
import BackupSettings from "@/pages/home/tabs/settingsTab/components/BackupSettings/BackupSettings";
import AdvancedSettings from "@/pages/home/tabs/settingsTab/components/AdvancedSettings/AdvancedSettings";

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

export type ItemId =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export type SettingsItem = {
  title: SettingsItemName;
  content: React.ComponentType<any>;
  isItemActive: boolean;
  itemId: ItemId;
};

export type SettingsState = {
  items: SettingsItem[];
  setItemActive: (itemId: ItemId) => void;

  theme: "light" | "dark" | "system" | "custom";
  setTheme: (theme: "light" | "dark" | "system" | "custom") => void;

  defaultViewMode: "cover" | "contain" | "fill" | "none";
  setDefaultViewMode: (mode: "cover" | "contain" | "fill" | "none") => void;

  showNSFW: boolean;
  toggleNSFW: () => void;

  libraryPath: string;
  setLibraryPath: (path: string) => void;
};

// ---- Component Map ---- //
const SETTINGS_ITEMS_COMPONENTS: Record<SettingsItemName, React.ComponentType<any>> = {
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
  items: Object.entries(SETTINGS_ITEMS_COMPONENTS).map(([title, content], index) => ({
    title: title as SettingsItemName,
    content,
    isItemActive: index === 0,
    itemId: String(index) as ItemId,
  })),

  setItemActive: (itemId) =>
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        isItemActive: item.itemId === itemId,
      })),
    })),

  theme: "system",
  setTheme: (theme) => set({ theme }),

  defaultViewMode: "contain",
  setDefaultViewMode: (mode) => set({ defaultViewMode: mode }),

  showNSFW: false,
  toggleNSFW: () => set((state) => ({ showNSFW: !state.showNSFW })),

  libraryPath: "",
  setLibraryPath: (path) => set({ libraryPath: path }),
}));

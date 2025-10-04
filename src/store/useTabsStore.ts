import { create } from "zustand";
import LibraryTab from "@/pages/home/tabs/libraryTab/libraryTab";
import DiscoverTab from "@/pages/home/tabs/discoverTab/discoverTab"
import SettingsTab from "@/pages/home/tabs/settingsTab/settingsTab";

export type TabType = "library" | "discover" | "settings";

export type TabItem<Props = any> = {
  id: string;
  name: string;
  type: TabType;
  listed?: boolean;
  tabContent: React.ComponentType<Props>;
  tabProps?: Props;
};

type TabsState = {
  tabs: TabItem[];
  recentTabs: TabItem[];
  activeTabId: string;
  addTab: (type: TabType) => void;
  closeTab: (id: string) => void;
  activateTab: (tabType: TabType, tabName: string) => void;
  setActiveTabId: (id: string) => void;
};

const TAB_COMPONENTS: Record<TabType, React.ComponentType<any>> = {
  library: LibraryTab,
  discover: DiscoverTab,
  settings: SettingsTab,
};

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [
    {
      id: "1",
      name: "Library",
      type: "library",
      listed: true,
      tabContent: LibraryTab,
    },
  ],
  recentTabs: [],
  activeTabId: "1",

  addTab: (type) => {
    const newId = crypto.randomUUID();

    let defaultProps: Record<string, any> = {};
    switch (type) {
      case "discover":
        defaultProps = {
          innerTabId: newId,
          qActive: true,
          qListed: true,
        };
        break;
    }

    const newTab: TabItem = {
      id: newId,
      name: type[0].toUpperCase() + type.slice(1),
      type,
      listed: true,
      tabContent: TAB_COMPONENTS[type],
      tabProps: defaultProps,
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newId,
    }));
  },

  closeTab: (id) => {
    set((state) => {
      if (state.tabs.length === 1) return state;

      const closedTab = state.tabs.find((t) => t.id === id);
      if (!closedTab) return state;

      // mark it unlisted
      const updatedClosedTab = { ...closedTab, listed: false };

      // filter it out of open tabs
      const filtered = state.tabs.filter((t) => t.id !== id);

      // push into recentTabs
      const updatedRecent = [...state.recentTabs, updatedClosedTab];

      let newActiveId = state.activeTabId;
      if (state.activeTabId === id && filtered.length > 0) {
        newActiveId = filtered[filtered.length - 1].id;
      }

      return { tabs: filtered, activeTabId: newActiveId, recentTabs: updatedRecent };
    });
  },

  activateTab: (tabType, tabName) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === state.activeTabId
          ? {
              ...t,
              type: tabType,
              name: tabName,
              tabContent: TAB_COMPONENTS[tabType],
              tabProps: (tabType === "discover")? { innerTabId: t.id, qActive: true, qListed: true } : t.tabProps ?? {},
            }
          : t
      ),
    }));
  },

  setActiveTabId: (id) => set({ activeTabId: id }),
}));

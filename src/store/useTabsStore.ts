import { create } from "zustand";

export type TabType = "library" | "discover" | "settings";

export type TabItem = {
  id: string;
  name: string;
  type: TabType;
  listed?: boolean;
};

type TabsState = {
  tabs: TabItem[];
  activeTabId: string;
  addTab: (type: TabType) => void;
  closeTab: (id: string) => void;
  activateTab: (tabType: TabType, tabName: string) => void;
  setActiveTabId: (id: string) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [{ id: "1", name: "Library", type: "library", listed: true }],
  activeTabId: "1",

  addTab: (type) => {
    const newId = crypto.randomUUID();
    const newTab: TabItem = {
      id: newId,
      name: type[0].toUpperCase() + type.slice(1),
      type,
      listed: true,
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newId,
    }));
  },

  closeTab: (id) => {
    set((state) => {
      if (state.tabs.length === 1) return state;

      const updated = state.tabs.map((t) =>
        t.id === id ? { ...t, listed: false } : t
      );

      const filtered = updated.filter((t) => t.id !== id);

      let newActiveId = state.activeTabId;
      if (state.activeTabId === id && filtered.length > 0) {
        newActiveId = filtered[filtered.length - 1].id;
      }

      return { tabs: filtered, activeTabId: newActiveId };
    });
  },

  activateTab: (tabType, tabName) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === state.activeTabId ? { ...t, type: tabType, name: tabName } : t
      ),
    }));
  },

  setActiveTabId: (id) => set({ activeTabId: id }),
}));

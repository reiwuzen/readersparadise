import { create } from "zustand";
import { toast } from "sonner";
import {
  i_n,
  TAB_COMPONENTS,
  tab_id_s,
  url_s,
  UseTabsState,
  Tab,
  TabDataMap,
  TabState,
  TabComponentMap,
  TabType,
} from "@/types/tabTypes";

/* --------------------------------
 * Tab + TabState Factories
 * -------------------------------- */
export function createTabState<T extends TabType>(
  type: T,
  name: string,
  url: string,
  data: TabDataMap[T]
): TabState {
  return {
    name,
    type,
    url: url as url_s,
    data,
    content: TAB_COMPONENTS[type],
  };
}

export function createTab<T extends TabType>(
  id: string,
  type: T,
  name: string,
  url: string,
  data: TabDataMap[T]
): Tab<T> {
  return {
    id: id as tab_id_s,
    index: 0 as i_n,
    states: [createTabState(type, name, url, data)],
    get activeData() {
      return this.states[this.index];
    },
  } as Tab<T>;
}

/* --------------------------------
 * Zustand Store
 * -------------------------------- */
const initialTabID = crypto.randomUUID() as tab_id_s;

export const useTabsStore = create<UseTabsState>((set, get) => ({
  activeTabId: initialTabID,
  tabs: [createTab(initialTabID, "library", "Library", "/library/", {})],
  recentTabs: [],
  timeLineOfActiveTabId: [initialTabID],

  /* --------------------------------
   * Timeline Management
   * -------------------------------- */
  setT_L_O_A_T_ID: (id, mode) =>
    set((s) => {
      let list = s.timeLineOfActiveTabId.filter((x) => x !== id);
      if (mode === "append") list.push(id);
      return {
        ...s,
        timeLineOfActiveTabId: list.slice(-20), // keep last 20 entries
      };
    }),

  /* --------------------------------
   * Tab Lifecycle
   * -------------------------------- */
  addTab: (type, data = {}) => {
    const id = crypto.randomUUID() as tab_id_s;
    get().setT_L_O_A_T_ID(id, "append");

    const name = type.charAt(0).toUpperCase() + type.slice(1);
    const newTab: Tab = createTab(id, type, name, `/${type}/`, data);

    set((s) => ({
      ...s,
      activeTabId: id,
      tabs: [...s.tabs, newTab],
    }));
  },

  closeTab: (id) => {
    get().setT_L_O_A_T_ID(id, "remove");
    set((s) => {
      const closedTab = s.tabs.find((t) => t.id === id);
      const filteredTabs = s.tabs.filter((t) => t.id !== id);
      const filteredRecentTabs = s.recentTabs.filter((rt) => rt.id !== id);

      const lastActiveId =
        s.timeLineOfActiveTabId[s.timeLineOfActiveTabId.length - 1];

      return {
        ...s,
        tabs: filteredTabs,
        recentTabs: closedTab
          ? [...filteredRecentTabs, closedTab]
          : filteredRecentTabs,
        activeTabId: lastActiveId ?? filteredTabs.at(-1)?.id ?? "",
      };
    });
  },

  switchTab: (id) => {
    get().setT_L_O_A_T_ID(id, "append");
    set(() => ({ activeTabId: id }));
  },

  /* --------------------------------
   * Recent Tabs
   * -------------------------------- */
  openRecentTab: (id) =>
    set((s) => {
      const tab = s.recentTabs.find((rt) => rt.id === id);
      if (!tab) return s;

      const filteredRecentTabs = s.recentTabs.filter((rt) => rt.id !== id);
      get().setT_L_O_A_T_ID(id, "append");

      return {
        ...s,
        activeTabId: id,
        tabs: [...s.tabs, tab],
        recentTabs: filteredRecentTabs,
      };
    }),

  closeRecentTab: (id) =>
    set((s) => ({
      ...s,
      recentTabs: s.recentTabs.filter((rt) => rt.id !== id),
    })),

  /* --------------------------------
   * Tab Data & Navigation
   * -------------------------------- */
  changeTabPage: (id, tabState) => {
    console.log("changetab used");
    get().updateTabData(id, "append", tabState);
  },

  duplicateTab: (id) => {
    const n_id = crypto.randomUUID() as tab_id_s;
    get().setT_L_O_A_T_ID(n_id, "append");

    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab) return s;

      const duplicateTab: Tab = {
        ...tab,
        id: n_id,
        states: tab.states.map((state) => ({ ...state })),
      };
      return {
        ...s,
        tabs: [...s.tabs, duplicateTab],
      };
    });
  },

  updateTabData: (id, mode, newState) =>
    set((s) => {
      console.log("updateTabData used");

      const updateTab = (tab: Tab): Tab => {
        let updatedStates = tab.states;
        let updatedIndex = tab.index;

        switch (mode) {
          case "append":
            updatedStates = [...tab.states, newState];
            updatedIndex = tab.states.length as i_n; // move to the newly added state
            console.log(
              updatedIndex,
              s.tabs.find((t) => t.id === id)?.index,
              s.tabs.find((t) => t.id === id)
            );
            break;

          case "replace": {
            const idx = tab.states.findIndex((d) => d.url === newState.url);
            if (idx !== -1) {
              updatedStates = [...tab.states];
              updatedStates[idx] = newState;
            } else {
              updatedStates = [...tab.states, newState];
              updatedIndex = tab.states.length as i_n;
            }
            break;
          }

          case "remove":
            updatedStates = tab.states.filter((d) => d.url !== newState.url);
            updatedIndex = Math.min(tab.index, updatedStates.length - 1) as i_n;
            break;
        }
        const activeData = updatedStates[updatedIndex];
        return {
          ...tab,
          states: updatedStates,
          index: updatedIndex,
          activeData,
        } as Tab;
      };

      return {
        ...s,
        tabs: s.tabs.map((t) => (t.id === id ? updateTab(t) : t)),
        recentTabs: s.recentTabs.map((t) => (t.id === id ? updateTab(t) : t)),
      };
    }),

  /* --------------------------------
   * Navigation
   * -------------------------------- */
  goBack: (id) =>
    set((s) => {
      const tabs = s.tabs.map((t) => {
        if (t.id !== id) return t;
        const newIndex = t.index > 0 ? ((t.index - 1) as i_n) : 0;
        if (t.index === 0) toast.info("Already at initial state");
        const activeData = t.states[newIndex];
        return { ...t, index: newIndex, activeData } as Tab;
      });
      return { ...s, tabs };
    }),

  goForward: (id) =>
    set((s) => {
      const tabs = s.tabs.map((t) => {
        if (t.id !== id) return t;
        const newIndex =
          t.index < t.states.length - 1 ? ((t.index + 1) as i_n) : t.index;
        if (t.index >= t.states.length - 1)
          toast.info("Already at latest state");
        const activeData = t.states[newIndex];
        return { ...t, index: newIndex, activeData } as Tab;
      });
      return { ...s, tabs };
    }),
}));

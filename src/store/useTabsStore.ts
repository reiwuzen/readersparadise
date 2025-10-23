import { create } from "zustand";
import LibraryTab from "@/components/tabs/libraryTab/libraryTab";
import DiscoverTab from "@/components/tabs/discoverTab/discoverTab";
import SettingsTab from "@/components/tabs/settingsTab/settingsTab";
import Reader from "@/components/reader/Reader";
import Book from "@/components/book/book";
import About from "@/components/about/About";
import { toast } from "sonner";

export type TabType =
  | "library"
  | "discover"
  | "settings"
  | "reader"
  | "about"
  | "book";

export type TabMetaData<Props = any> = {
  name: string;
  type: TabType;
  url: string;
  tabContent: React.ComponentType<Props>;
  data?: object;
  sVal?: string;
  tabSubContent?: React.ComponentType<Props>;
};

export type TabItem = {
  id: string;
  listed: boolean;
  activeMetaData: TabMetaData;
  currentIndex: number;
  metaData: TabMetaData[];
};

type TabsState = {
  tabs: TabItem[];
  recentTabs: TabItem[];
  activeTabId: string;
  timelineOfActiveTab: string[];
  updateActiveMetaData: (tabId: string, newMeta: Partial<TabMetaData>) => void;
  setTimelineOfActiveTab: (id: string, m: "a" | "r") => void;
  addTab: (type: TabType) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  changeTab: (
    id: string,
    name: string,
    type: TabType,
    url: string,
    sVal?: string,
    data?: object,
    comp?: React.ComponentType<any>
  ) => void;
  openRecentTabs: (id: string) => void;
  closeRecentTabs: (id: string) => void;
  goBack: (id: string) => void;
  goForward: (id: string) => void;
};

const TAB_COMPONENTS: Record<TabType, React.ComponentType<any>> = {
  library: LibraryTab,
  discover: DiscoverTab,
  settings: SettingsTab,
  reader: Reader,
  about: About,
  book: Book,
};

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  recentTabs: [],
  activeTabId: "",
  timelineOfActiveTab: [],

  setTimelineOfActiveTab: (id, m) =>
    set((s) => {
      let newTimeline = s.timelineOfActiveTab.filter((nt) => nt !== id);
      if (m === "a") newTimeline = [...newTimeline, id].slice(-20);
      return { ...s, timelineOfActiveTab: newTimeline };
    }),

  updateActiveMetaData: (tabId, newMeta) =>
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.id !== tabId) return t;
        const updatedMeta = {
          ...t.activeMetaData,
          ...newMeta,
          data: {
            ...t.activeMetaData.data,
            ...newMeta.data,
          },
        };
        const newMetaDataArr = t.metaData.map((m, i) =>
          i === t.currentIndex ? updatedMeta : m
        );
        return { ...t, activeMetaData: updatedMeta, metaData: newMetaDataArr };
      }),
    })),

  addTab: (type) => {
    const tabId = crypto.randomUUID();
    get().setTimelineOfActiveTab(tabId, "a");
    set((s) => {
      const initialMeta: TabMetaData = {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type,
        url: `/${type}/`,
        tabContent: TAB_COMPONENTS[type],
      };
      const tab: TabItem = {
        id: tabId,
        listed: true,
        currentIndex: 0,
        activeMetaData: initialMeta,
        metaData: [initialMeta],
      };
      return { ...s, activeTabId: tab.id, tabs: [...s.tabs, tab] };
    });
  },

  closeTab: (id) => {
    get().setTimelineOfActiveTab(id, "r");
    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab) return s;
      const recentTab = { ...tab, listed: false };
      const newTabs = s.tabs.filter((t) => t.id !== id);
      const newActive =
        s.timelineOfActiveTab.length > 0
          ? s.timelineOfActiveTab[s.timelineOfActiveTab.length - 1]
          : "";
      return {
        ...s,
        tabs: newTabs,
        recentTabs: [...s.recentTabs, recentTab],
        activeTabId: newActive,
      };
    });
  },

  switchTab: (id) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab) {
        toast.error("Tab not found");
        return s;
      }
      const timeline = s.timelineOfActiveTab.filter((nt) => nt !== id);
      return {
        ...s,
        activeTabId: id,
        timelineOfActiveTab: [...timeline, id].slice(-20),
      };
    }),

  // 🔥 Unified changeTab (merged setNewMetaData)
  changeTab: (id, name, type, url, sVal,data , comp) =>
    set((s) => {
      const tabs = s.tabs.map((t) => {
        if (t.id !== id) return t;

        const baseMeta = t.activeMetaData;
        const nextMeta: TabMetaData = {
          ...baseMeta,
          name,
          type,
          url: `/${type}/${url ?? ""}`,
          tabContent: comp ?? TAB_COMPONENTS[type],
          data: { ...baseMeta.data, ...data },

          sVal: sVal ?? baseMeta.sVal,
          tabSubContent: comp ?? baseMeta.tabSubContent,
        };

        const newMetaDataArr = [
          ...t.metaData.slice(0, t.currentIndex + 1),
          nextMeta,
        ];

        return {
          ...t,
          currentIndex: newMetaDataArr.length - 1,
          activeMetaData: nextMeta,
          metaData: newMetaDataArr,
        };
      });

      return { ...s, tabs };
    }),

  openRecentTabs: (id) =>
    set((s) => {
      const recentTab = s.recentTabs.find((rt) => rt.id === id);
      if (!recentTab) {
        toast.error("Recent tab not found");
        return s;
      }
      if (s.tabs.some((t) => t.id === id)) {
        toast.info("Tab already open");
        return s;
      }
      const tab = { ...recentTab, listed: true };
      const newRecentTabs = s.recentTabs.filter((rt) => rt.id !== id);
      const timeline = s.timelineOfActiveTab.filter((nt) => nt !== id);
      return {
        ...s,
        tabs: [...s.tabs, tab],
        recentTabs: newRecentTabs,
        activeTabId: id,
        timelineOfActiveTab: [...timeline, id].slice(-20),
      };
    }),

  closeRecentTabs: (id) =>
    set((s) => ({
      ...s,
      recentTabs: s.recentTabs.filter((rt) => rt.id !== id),
    })),

  goBack: (id) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab) return s;
      if (tab.currentIndex === 0) {
        toast.info("Already at the first state");
        return s;
      }
      const newIndex = tab.currentIndex - 1;
      const updatedTab = {
        ...tab,
        currentIndex: newIndex,
        activeMetaData: tab.metaData[newIndex],
      };
      return { ...s, tabs: s.tabs.map((t) => (t.id === id ? updatedTab : t)) };
    }),

  goForward: (id) =>
    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab) return s;
      const maxIndex = tab.metaData.length - 1;
      if (tab.currentIndex >= maxIndex) {
        toast.info("Already at the latest state");
        return s;
      }
      const newIndex = tab.currentIndex + 1;
      const updatedTab = {
        ...tab,
        currentIndex: newIndex,
        activeMetaData: tab.metaData[newIndex],
      };
      return { ...s, tabs: s.tabs.map((t) => (t.id === id ? updatedTab : t)) };
    }),
}));

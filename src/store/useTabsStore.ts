import { create } from "zustand";
import LibraryTab from "@/components/tabs/libraryTab/libraryTab";
import DiscoverTab from "@/components/tabs/discoverTab/discoverTab";
import SettingsTab from "@/components/tabs/settingsTab/settingsTab";
import Reader from "@/components/reader/Reader";
import About from "@/components/about/About";
import { toast } from "sonner";

export type TabType = "library" | "discover" | "settings" | "reader" | "about";

export type TabMetaData<Props = any> = {
  name: string;
  type: TabType;
  url: string;
  tabContent: React.ComponentType<Props>;
  optional?: {
    sVal: string;
    tabSubContent?: React.ComponentType<Props>;
  };
};

export type TabItem = {
  id: string;
  listed: boolean;
  activeMetaData: TabMetaData; // make activemeta data the

  currentIndex: number;
  metaData: TabMetaData[];
};

type TabsState = {
  tabs: TabItem[];
  recentTabs: TabItem[];
  activeTabId: string;
  timelineOfActiveTab: string[];
  setTimelineOfActiveTab: (id: string, m: "a" | "r") => void;
  setNewMetaData: (id: string, name: string, url: string) => void;
  addTab: (type: TabType) => void;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  changeTab: (id: string, name: string, type: TabType) => void;
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
};

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  recentTabs: [],
  activeTabId: "",
  timelineOfActiveTab: [],
  setTimelineOfActiveTab: (id, m) =>
    set((s) => {
      const newTimeline = s.timelineOfActiveTab.filter((nt) => nt !== id);
      if (m === "a") return { ...s, timelineOfActiveTab: [...newTimeline, id] };
      if (m === "r") return { ...s, timelineOfActiveTab: newTimeline };
      return s; // fallback
    }),
  setNewMetaData: (id, name, url, comp?: React.ComponentType<any>) =>
    set((s) => {
      const tabs = s.tabs.map((t) => {
        if (t.id !== id) return t;

        const h = () => {
          if (
            t.activeMetaData.optional !== null &&
            t.activeMetaData.optional !== undefined
          ) {
            return {
              ...t.activeMetaData,
              name,
              url,
              optional: {
                sVal: t.activeMetaData.optional.sVal ?? "",
                tabSubContent: comp,
              },
            };
          } else {
            return {
              ...t.activeMetaData,
              name,
              url,
            };
          }
        };
        // Create new metadata object
        const newMeta = h();
        // Append it to the metaData array
        const newMetaDataArr = [...t.metaData, newMeta];

        return {
          ...t,
          activeMetaData: newMeta,
          metaData: newMetaDataArr,
          currentIndex: newMetaDataArr.length - 1, // set newMeta as current
        };
      });

      return { ...s, tabs };
    }),
  addTab: (type) => {
    const tabId = crypto.randomUUID();

    // First update timeline using existing action
    get().setTimelineOfActiveTab(tabId, "a");

    // Then create the tab in a separate set()
    set((s) => {
      const initialMeta: TabMetaData = {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type,
        url: `/${type}`,
        tabContent: TAB_COMPONENTS[type],
      };

      const tab: TabItem = {
        id: tabId,
        listed: true,
        currentIndex: 0,
        activeMetaData: initialMeta,
        metaData: [initialMeta],
      };

      return {
        ...s,
        activeTabId: tab.id,
        tabs: [...s.tabs, tab],
      };
    });
  },

  closeTab: (id) => {
    // First remove from timeline safely
    get().setTimelineOfActiveTab(id, "r");

    // Then update tabs
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
      return {
        ...s,
        activeTabId: id,
        timelineOfActiveTab: [...s.timelineOfActiveTab, id],
      };
    }),

  changeTab: (id, name, type) =>
    set((s) => {
      const tabs = s.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              currentIndex: t.currentIndex + 1,
              metaData: [
                ...t.metaData,
                {
                  name,
                  type,
                  url: `/${type}`,
                  tabContent: TAB_COMPONENTS[type],
                },
              ],
              activeMetaData: {
                name,
                type,
                url: `/${type}`,
                tabContent: TAB_COMPONENTS[type],
              },
            }
          : t
      );
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

      return {
        ...s,
        tabs: [...s.tabs, tab],
        recentTabs: newRecentTabs,
        activeTabId: id,
        timelineOfActiveTab: [...s.timelineOfActiveTab, id],
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
      const updatedTab: TabItem = {
        ...tab,
        currentIndex: newIndex,
        activeMetaData: tab.metaData[newIndex],
      };

      toast.info(`Went back to "${tab.metaData[newIndex].name}"`);

      return {
        ...s,
        tabs: s.tabs.map((t) => (t.id === id ? updatedTab : t)),
      };
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
      const updatedTab: TabItem = {
        ...tab,
        currentIndex: newIndex,
        activeMetaData: tab.metaData[newIndex],
      };

      toast.info(`Went forward to "${tab.metaData[newIndex].name}"`);

      return {
        ...s,
        tabs: s.tabs.map((t) => (t.id === id ? updatedTab : t)),
      };
    }),
}));

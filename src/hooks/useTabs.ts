import { useTabsStore } from "../store/useTabsStore"; // path to the zustand store
// import type { TabType, TabItem } from "../store/useTabsStore";

export const useTabs = () => {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const addTab = useTabsStore((state) => state.addTab);
  const closeTab = useTabsStore((state) => state.closeTab);
  const activateTab = useTabsStore((state) => state.activateTab);
  const setActiveTabId = useTabsStore((state) => state.setActiveTabId);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return {
    tabs,
    activeTab,
    activeTabId,
    addTab,
    closeTab,
    activateTab,
    setActiveTabId,
  };
};

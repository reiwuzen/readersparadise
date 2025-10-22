import { useTabsStore } from "@/store/useTabsStore";

export const useTabs = () => {
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const tabs = useTabsStore((s) => s.tabs);
  const recentTabs = useTabsStore((s) => s.recentTabs);
  const timelineOfActiveTab = useTabsStore((s) => s.timelineOfActiveTab);
  const setNewMetaData =useTabsStore((s)=>s.setNewMetaData);
  const addTab = useTabsStore((s) => s.addTab);
  const closeTab = useTabsStore((s) => s.closeTab);
  const switchTab = useTabsStore((s) => s.switchTab);
  const changeTab = useTabsStore((s) => s.changeTab);
  const openRecentTabs = useTabsStore((s) => s.openRecentTabs);
  const closeRecentTabs = useTabsStore((s) => s.closeRecentTabs);
  const goBack = useTabsStore((s) => s.goBack);
  const goForward = useTabsStore((s) => s.goForward);
  return {
    activeTabId,
    tabs,
    recentTabs,
    timelineOfActiveTab,
    setNewMetaData,
    addTab,
    changeTab,
    closeRecentTabs,
    closeTab,
    goBack,
    goForward,
    switchTab,
    openRecentTabs,
  };
};

import { useTabsStore } from "@/store/useTabsStore";
import { Mode } from "@/types/globalTypes";
import { Tab, TabState, TabType } from "@/types/tabTypes";

export const useActiveTab = () => {
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const activeTab = useTabsStore
    .getState()
    .tabs.find((t) => t.id === activeTabId) as Tab;
  const activeTabData = useTabsStore
    .getState()
    .tabs.find((t) => t.id === activeTabId)?.activeData;
  const goBackActiveTab = () => {
    if (!activeTabId) return;
    useTabsStore.getState().goBack(activeTabId);
  };

  const goForwardActiveTab = () => {
    if (!activeTabId) return;
    useTabsStore.getState().goForward(activeTabId);
  };

  const updateActiveTabData = (mode: Mode, tabState: TabState) => {
    if (!activeTabId) return;
    useTabsStore.getState().updateTabData(activeTabId, mode, tabState);
  };

  const duplicateActiveTab = () => {
    if (!activeTabId) return;
    useTabsStore.getState().duplicateTab(activeTabId);
  };
  const changeActiveTabPage = (tabState: TabState) => {
    if (!activeTabId) return;
    useTabsStore.getState().changeTabPage(activeTabId, tabState);
  };
  return {
    activeTabId,
    activeTab,
    activeTabData,
    goBackActiveTab,
    goForwardActiveTab,
    updateActiveTabData,
    duplicateActiveTab,
    changeActiveTabPage,
  };
};

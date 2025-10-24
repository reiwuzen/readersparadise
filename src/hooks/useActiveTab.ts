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

  const updateActiveTabData = (mode: Mode, tabData: TabState) => {
    if (!activeTabId) return;
    useTabsStore.getState().updateTabData(activeTabId, mode, tabData);
  };

  const duplicateActiveTab = () => {
    if (!activeTabId) return;
    useTabsStore.getState().duplicateTab(activeTabId);
  };
  const changeActiveTabPage = (data: TabState) => {
    if (!activeTabId) return;
    useTabsStore.getState().changeTabPage(activeTabId, data);
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

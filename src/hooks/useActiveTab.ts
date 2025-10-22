// Hook to get the active tab along with navigation helpers
import { useTabsStore } from "@/store/useTabsStore";
import { toast } from "sonner";

export const useActiveTab = () => {
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const tabs = useTabsStore((s) => s.tabs);
  const goBackStore = useTabsStore((s) => s.goBack);
  const goForwardStore = useTabsStore((s) => s.goForward);
  const setNewMetaDataStore = useTabsStore((s) => s.setNewMetaData);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
  const activeMetaData = activeTab ? activeTab.activeMetaData ?? null : null;

  // Navigate history
  const goBack = () => {
    if (!activeTab) return;
    if (activeTab.currentIndex === 0) {
      toast.info("Already at the first state");
      return;
    }
    goBackStore(activeTab.id);
  };

  const goForward = () => {
    if (!activeTab) return;
    const maxIndex = activeTab.metaData.length - 1;
    if (activeTab.currentIndex >= maxIndex) {
      toast.info("Already at the latest state");
      return;
    }
    goForwardStore(activeTab.id);
  };

  // Push new metadata as current state
  const setNewMetaData = (name: string, url: string, optional?: any) => {
    if (!activeTab) return;
    const updatedName = name ?? activeMetaData?.name ?? "";
    const updatedUrl = url ?? activeMetaData?.url ?? "";
    const newMeta = {
      ...activeMetaData,
      name: updatedName,
      url: updatedUrl,
      optional: optional ?? activeMetaData?.optional,
    };
    setNewMetaDataStore(activeTab.id, newMeta.name, newMeta.url);
  };

  return {
    activeTab,
    activeMetaData,
    activeTabId,
    goBack,
    goForward,
    setNewMetaData, // new helper for pushing new metadata
  };
};

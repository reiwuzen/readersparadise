import { useTabsStore } from "@/store/useTabsStore";
import { toast } from "sonner";

// Hook to get the active tab along with navigation helpers
export const useActiveTab = () => {
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const tabs = useTabsStore((s) => s.tabs);

  const goBackStore = useTabsStore((s) => s.goBack);
  const goForwardStore = useTabsStore((s) => s.goForward);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
  const activeMetaData = activeTab
    ? activeTab.activeMetaData ?? null
    : null;

  // Helper functions that include toast feedback
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

  return {
    activeTab,
    activeMetaData,
    activeTabId,
    goBack,
    goForward,
  };
};

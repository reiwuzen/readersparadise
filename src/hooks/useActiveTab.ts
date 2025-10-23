// Hook to get the active tab along with navigation helpers
import { TabMetaData } from "@/store/useTabsStore";
import { useTabsStore } from "@/store/useTabsStore";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import { toast } from "sonner";

export const useActiveTab = () => {
  const setBookChapterStore = useDiscoverStore((s) => s.setBookChapter);
  const setSelectedBookStore = useDiscoverStore((s) => s.setSelectedBook);
  const bookChapter = useDiscoverStore((s) => s.bookChapter);
  const selectedBook = useDiscoverStore((s) => s.selectedBook);

  const activeTabId = useTabsStore((s) => s.activeTabId);
  const tabs = useTabsStore((s) => s.tabs);
  const goBackStore = useTabsStore((s) => s.goBack);
  const goForwardStore = useTabsStore((s) => s.goForward);
  const setNewMetaDataStore = useTabsStore((s) => s.setNewMetaData);
  const updateActiveMetaDataStore = useTabsStore((s) => s.updateActiveMetaData);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;
  const activeMetaData = activeTab?.activeMetaData ?? null;

  // --- update the current metadata entry (no new history entry)
  const updateActiveMetaData = (inp: Partial<TabMetaData>) => {
    if (!activeTab) return;
    updateActiveMetaDataStore(activeTab.id, inp);
  };

  // --- navigate backward in tab history
  const goBack = () => {
    if (!activeTab) return;

    const prevIndex = activeTab.currentIndex - 1;
    if (prevIndex < 0) {
      toast.info("Already at the first state");
      return;
    }

    const prevMeta = activeTab.metaData[prevIndex];
    const prevData = prevMeta?.data as any;
    if (bookChapter) {

      setBookChapterStore(null);
    } else if(selectedBook){
      setSelectedBookStore(null);
      
    } else {
      setSelectedBookStore(prevData?.selectedBook ?? null);
      setBookChapterStore(prevData?.bookChapter ?? null);
    }
    // Restore previous Discover state
    console.log(activeTab.metaData);
    goBackStore(activeTab.id);
  };

  // --- navigate forward in tab history
  const goForward = () => {
    if (!activeTab) return;

    const nextIndex = activeTab.currentIndex + 1;
    if (nextIndex >= activeTab.metaData.length) {
      toast.info("Already at the latest state");
      return;
    }

    const nextMeta = activeTab.metaData[nextIndex];
    const nextData = nextMeta?.data as any;

    // Restore next Discover state
    setSelectedBookStore(nextData?.selectedBook ?? null);
    setBookChapterStore(nextData?.bookChapter ?? null);

    goForwardStore(activeTab.id);
  };

  // --- push new metadata (creates a new history entry)
  const setNewMetaData = (
    name: string,
    url: string,
    optional?: any,
    comp?: React.ComponentType<any>,
    data?: object // ✅ added
  ) => {
    if (!activeTab) return;

    const updatedName = name ?? activeMetaData?.name ?? "";
    const updatedUrl = url ?? activeMetaData?.url ?? "";

    const newMeta: TabMetaData = {
      ...activeMetaData,
      name: updatedName,
      url: updatedUrl,
      optional: optional ?? activeMetaData?.optional,
      data: data ?? activeMetaData?.data, // ✅ store context
    } as TabMetaData;

    setNewMetaDataStore(
      activeTab.id,
      newMeta.name,
      newMeta.url,
      comp,
      newMeta.data
    );
  };

  return {
    activeTab,
    activeMetaData,
    activeTabId,
    goBack,
    goForward,
    setNewMetaData,
    updateActiveMetaData,
  };
};

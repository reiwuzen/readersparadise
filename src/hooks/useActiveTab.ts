// import { TabMetaData, useTabsStore } from "@/store/useTabsStore";
// import { useDiscoverStore } from "@/store/useDiscoverStore";
// import { toast } from "sonner";

// export const useActiveTab = () => {
//   // --- Discover store (stable individual selectors)
//   const setBookChapterStore = useDiscoverStore((s) => s.setBookChapter);
//   const setSelectedBookStore = useDiscoverStore((s) => s.setSelectedBook);
//   const bookChapterStore = useDiscoverStore((s) => s.bookChapter);
//   const selectedBookStore = useDiscoverStore((s) => s.selectedBook);

//   // --- Tabs store (individual selectors, stable)
//   const activeTabIdStore = useTabsStore((s) => s.activeTabId);
//   const tabsStore = useTabsStore((s) => s.tabs);
//   const goBackStore = useTabsStore((s) => s.goBack);
//   const goForwardStore = useTabsStore((s) => s.goForward);
//   const updateActiveMetaDataStore = useTabsStore((s) => s.updateActiveMetaData);
//   const changeTabStore = useTabsStore((s) => s.changeTab);

//   // --- Resolve current active tab + metadata
//   const activeTab = tabsStore.find((t) => t.id === activeTabIdStore) ?? null;
//   const activeMetaData = activeTab?.activeMetaData ?? null;

//   // --- Update current metadata entry (no new history)
//   const updateActiveMetaData = (inp: Partial<TabMetaData>) => {
//     if (!activeTab) return;
//     updateActiveMetaDataStore(activeTab.id, inp);
//   };

//   // --- Helper: safely restore discover state (for back/forward)
//   const restoreDiscoverStateStore = (data?: any) => {
//     const nextSelected = data?.selectedBook ?? null;
//     const nextChapter = data?.bookChapter ?? null;

//     if (nextSelected !== selectedBookStore) setSelectedBookStore(nextSelected);
//     if (nextChapter !== bookChapterStore) setBookChapterStore(nextChapter);
//   };

//   // --- Navigate backward in tab history
//   const goBack = () => {
//     if (!activeTab) return;

//     const prevIndex = activeTab.currentIndex - 1;
//     if (prevIndex < 0) {
//       toast.info("Already at the first state");
//       return;
//     }

 

//     goBackStore(activeTab.id);
//   };

//   // --- Navigate forward in tab history
//   const goForward = () => {
//     if (!activeTab) return;

//     const nextIndex = activeTab.currentIndex + 1;
//     if (nextIndex >= activeTab.metaData.length) {
//       toast.info("Already at the latest state");
//       return;
//     }



//     goForwardStore(activeTab.id);
//   };

//   // --- Push new metadata (creates new history entry)
//   const pushNewMeta = (
//     name: string,
//     url: string,
//     type?: string,
//     sVal?:string,
//     data?: object,
//     comp?: React.ComponentType<any>,
//   ) => {
//     if (!activeTab || !activeMetaData) return;

//     const resolvedName = name || activeMetaData.name;
//     const resolvedUrl = url || activeMetaData.url;
//     const resolvedType = (type as any) ?? activeMetaData.type;

//     changeTabStore(
//       activeTab.id,
//       resolvedName,
//       resolvedType,
//       resolvedUrl,
//       sVal,
//       data ?? activeMetaData.data,
//       comp
//     );
//   };

//   return {
//     activeTab,
//     activeMetaData,
//     activeTabId: activeTabIdStore,
//     goBack,
//     goForward,
//     updateActiveMetaData,
//     pushNewMeta,
//   };
// };

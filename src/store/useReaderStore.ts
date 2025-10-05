// useReaderStore.ts
import { create } from "zustand";
import Reader from "@/components/reader/Reader";
import { useImportStore } from "./useImportStore";
import { useTabsStore } from "./useTabsStore";
import { toast } from "sonner";

export let window_size = 5;
export let mid = Math.floor(window_size / 2);

type CurrentBook = {
  name: string;
  pages: string[];
  base64Images: string[];
  currentPage: string;
  pageIndex: number;
  prevPage: () => Promise<void>;
  nextPage: () => Promise<void>;
};

type ReaderState = {
  readers: Record<string, CurrentBook | undefined>; // key = tabId
  readerContent: React.ComponentType<any>;
  openReader: (tabId: string, bookName: string) => Promise<void>;
};

export const useReaderStore = create<ReaderState>((set, get) => ({
  readers: {},
  readerContent: Reader,

  openReader: async (tabId, bookName) => {

    const { activateTab } = useTabsStore.getState();
    const { mangas, loadPageBatch } = useImportStore.getState();

    const chosen = mangas.find((m) => m.name === bookName); 

    if (!chosen) return;
    const startIndex = chosen.indexByTab[tabId] ?? 0;
    await loadPageBatch(chosen.name, startIndex, tabId);

    const updated = useImportStore
      .getState()
      .mangas.find((m) => m.name === chosen.name);
    if (!updated) return;

    const makePageHandler = (dir: "prev" | "next") => async () => {
      const { readers } = get();
      const reader = readers[tabId];
      if (!reader) return;

      const { setCurrentIndex } = useImportStore.getState();

      if (dir === "prev" && reader.pageIndex === 0) {
        toast.error("First Page", { description: "Can't go back" });
        return;
      }

      if (dir === "next" && reader.pageIndex + 1 === reader.pages.length) {
        toast.error("Last Page", { description: "Can't go forward" });
        return;
      }

      const newIndex =
        dir === "prev"
          ? Math.max(reader.pageIndex - 1, 0)
          : Math.min(reader.pageIndex + 1, reader.pages.length - 1);

      setCurrentIndex(reader.name, reader.pageIndex, dir);
      await useImportStore.getState().loadPageBatch(reader.name, newIndex, tabId);

      const updatedBook = useImportStore
        .getState()
        .mangas.find((m) => m.name === reader.name);
      if (!updatedBook) return;

      set((state) => ({
        readers: {
          ...state.readers,
          [tabId]: {
            ...reader,
            pageIndex: newIndex,
            base64Images: updatedBook.base64ByTab[tabId],
            currentPage: updatedBook.base64ByTab[tabId]?.[mid],
          },
        },
      }));
    };

    set((state) => ({
      readers: {
        ...state.readers,
        [tabId]: {
          name: updated.name,
          pages: updated.images,
          base64Images: updated.base64ByTab[tabId],
          currentPage: updated.base64ByTab[tabId]?.[mid],
          pageIndex: updated.indexByTab[tabId],
          prevPage: makePageHandler("prev"),
          nextPage: makePageHandler("next"),
        },
      },
    }));

    activateTab("reader", `Reader-${chosen.name}`);
    console.log("open reader in tab", tabId);
  },
}));

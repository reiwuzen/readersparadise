import { create } from "zustand";
import Reader from "@/components/reader/Reader";
import { useImportStore } from "./useImportStore";
import { useTabsStore } from "./useTabsStore";
import { toast } from "sonner";
export let window_size = 5;
export let mid = Math.floor(window_size / 2);
//useReaderStore.ts
type CurrentBook = {
  name: string;
  pages: string[];
  base64Images: string[];
  currentPage: string;
  pageIndex: number;
  prevPage: () => void;
  nextPage: () => void;
};

type ReaderState = {
  currentBook?: CurrentBook;
  readerContent: React.ComponentType<any>;
  openReader: (bookName: string) => void;
};

export const useReaderStore = create<ReaderState>((set, get) => ({
  readerContent: Reader,
  currentBook: undefined,

  openReader: async (bookName) => {
    const { activateTab } = useTabsStore.getState();

    const { mangas, loadPageBatch } = useImportStore.getState();

    const chosen = mangas.find((m) => m.name === bookName);

    if (!chosen) return;

    await loadPageBatch(chosen.name, chosen.currentIndex);

    // Update after batch load
    const updated = useImportStore
      .getState()
      .mangas.find((m) => m.name === chosen.name);
    if (!updated) return;

    set({
      currentBook: {
        name: updated.name,
        pages: updated.images,
        base64Images: updated.base64Images,
        currentPage: updated.base64Images[mid],
        pageIndex: updated.currentIndex,
        prevPage: async () => {
          const {setCurrentIndex} = useImportStore.getState();
          const { currentBook } = get();
          if (!currentBook) return;
          if( currentBook.pageIndex === 0) return toast.error(`First Page`,{
            description: "Can't go to prev Page"
          })
          setCurrentIndex(currentBook.name, currentBook.pageIndex, 'prev');
          const newIndex = Math.max(currentBook.pageIndex - 1, 0);
          // Wait for batch to load
          await useImportStore
            .getState()
            .loadPageBatch(currentBook.name, newIndex);

          // Get the updated book state from the store
          const updatedBook = useImportStore
            .getState()
            .mangas.find((m) => m.name === currentBook.name);
          if (!updatedBook) return;

          set({
            currentBook: {
              ...currentBook,
              pageIndex: newIndex,
              base64Images: updatedBook.base64Images,
              currentPage: updatedBook.base64Images[mid],
            },
          });
          console.log("prevPage", newIndex)
        },

        nextPage: async () => {
          const { currentBook } = get();
          const {setCurrentIndex} = useImportStore.getState();
          if (!currentBook) return;
          setCurrentIndex(currentBook.name, currentBook.pageIndex, 'next');
          if (currentBook.pageIndex+1 === currentBook.pages.length) return toast.error(`Last Page`,{
            description: "Can't go to next Page"
          })
          const newIndex = Math.min(
            currentBook.pageIndex + 1,
            currentBook.pages.length - 1
          );

          await useImportStore
            .getState()
            .loadPageBatch(currentBook.name, newIndex);

          const updatedBook = useImportStore
            .getState()
            .mangas.find((m) => m.name === currentBook.name);
          if (!updatedBook) return;

          set({
            currentBook: {
              ...currentBook,
              pageIndex: newIndex,
              base64Images: updatedBook.base64Images,
              currentPage: updatedBook.base64Images[mid],
            },
          });
          console.log("nextPage", newIndex)
        },
      },
    });

    activateTab("reader", `Reader-${chosen.name}`);
    console.log("open reader");
  },
}));

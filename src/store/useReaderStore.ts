import { create } from "zustand";
import Reader from "@/components/reader/Reader";
import { MangaFolder } from "./useImportStore";
import { useTabsStore } from "./useTabsStore";

type CurrentBook = {
  name: string;
  pages: string[];
  openPage?: string;
  pageIndex: number;
  prevPage: () => void;
  nextPage: () => void;
};

type ReaderState = {
  currentBook?: CurrentBook;
  readerContent: React.ComponentType<any>;
  openReader: (bookName: string, mangas: MangaFolder[]) => void;
};

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBook: undefined,
  readerContent: Reader,

  openReader: (bookName, mangas) => {
    const {activateTab} = useTabsStore.getState();
    const chosenBook = mangas.find((b) => b.name === bookName);
    if (!chosenBook) return;

    // Initialize at first page (index 0)
    const pages = chosenBook.images;

    set({
      currentBook: {
        name: chosenBook.name,
        pages,
        openPage: chosenBook.images[0],
        pageIndex: 0,
        prevPage: () => {
          const { currentBook } = get();
          if (!currentBook) return;
          const newIndex = Math.max(currentBook.pageIndex - 1, 0);
          set({
            currentBook: { ...currentBook, pageIndex: newIndex },
          });
        },
        nextPage: () => {
          const { currentBook } = get();
          if (!currentBook) return;
          const newIndex = Math.min(
            currentBook.pageIndex + 1,
            currentBook.pages.length - 1
          );
          set({
            currentBook: { ...currentBook, pageIndex: newIndex },
          });
        },
      },
    });
    const readerName = `Reader-${chosenBook.name}`;
    activateTab('reader', readerName);
    // 👇 if you want: open a new tab programmatically
    // useTabsStore.getState().addTab({
    //   id: `reader-${chosenBook.name}`,
    //   name: chosenBook.name,
    //   content: <Reader />,
    // });
  },
}));

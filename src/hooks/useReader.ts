import { useReaderStore } from "@/store/useReaderStore";

export const useReader = () => {
  const currentBook = useReaderStore((state) => state.currentBook);
  const readerContent = useReaderStore((state) => state.readerContent);
  const openReader = useReaderStore((state) => state.openReader);
  return { currentBook, readerContent, openReader };
};

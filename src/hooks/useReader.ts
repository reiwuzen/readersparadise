import { useReaderStore } from "@/store/useReaderStore";

export const useReader = () => {
  const readers = useReaderStore((state) => state.readers);
  const readerContent = useReaderStore((state) => state.readerContent);
  const openReader = useReaderStore((state) => state.openReader);
  return { readers, readerContent, openReader };
};

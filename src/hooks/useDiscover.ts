import { useDiscoverStore } from "@/store/useDiscoverStore";

export const useDiscover = () => {
  const searchResults = useDiscoverStore((s) => s.searchResults);
  const chapterData = useDiscoverStore((s) => s.chapterData);
  const isLoading = useDiscoverStore((s) => s.isLoading);
  const error = useDiscoverStore((s) => s.error);
  const searchManga = useDiscoverStore((s) => s.searchManga);
  const fetchChapterImages = useDiscoverStore((s) => s.fetchChapterImages);
  const clearResults = useDiscoverStore((s) => s.clearResults);
  return {
    searchResults,
    chapterData,
    isLoading,
    error,
    searchManga,
    fetchChapterImages,
    clearResults,
  };
};

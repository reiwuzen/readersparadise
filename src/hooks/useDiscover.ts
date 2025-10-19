import { useDiscoverStore } from "@/store/useDiscoverStore";

export const useDiscover = () => {
  const searchResults = useDiscoverStore((s) => s.searchResults);
  const chapterData = useDiscoverStore((s) => s.chapterData);
  const isLoading = useDiscoverStore((s) => s.isLoading);
  const error = useDiscoverStore((s) => s.error);
  const selectedManga = useDiscoverStore((s) => s.selectedManga);
  const getSelectedMangaInfo = useDiscoverStore((s) => s.getSelectedMangaInfo);
  const setSelectedManga = useDiscoverStore((s) => s.setSelectedManga);
  const searchManga = useDiscoverStore((s) => s.searchManga);
  const fetchChapterImages = useDiscoverStore((s) => s.fetchChapterImages);
  const clearResults = useDiscoverStore((s) => s.clearResults);
  return {
    searchResults,
    chapterData,
    isLoading,
    error,
    selectedManga,
    getSelectedMangaInfo,
    setSelectedManga,
    searchManga,
    fetchChapterImages,
    clearResults,
  };
};

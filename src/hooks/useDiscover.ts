import { useDiscoverStore } from "@/store/useDiscoverStore";

export const useDiscover = () => {
  const searchResults = useDiscoverStore((s) => s.searchResults);
  const chapterData = useDiscoverStore((s) => s.chapterData);
  const isLoading = useDiscoverStore((s) => s.isLoading);
  const error = useDiscoverStore((s) => s.error);
  const selectedBook = useDiscoverStore((s) => s.selectedBook);
  const bookChapter = useDiscoverStore((s)=>s.bookChapter);
  const getBookChapter =useDiscoverStore((s)=>s.getBookChapter);
  const getSelectedBookInfo = useDiscoverStore((s) => s.getSelectedBookInfo);
  const setSelectedBook = useDiscoverStore((s) => s.setSelectedBook);
  const searchBook = useDiscoverStore((s) => s.searchBook);
  const fetchChapterImages = useDiscoverStore((s) => s.fetchChapterImages);
  const clearResults = useDiscoverStore((s) => s.clearResults);
  return {
    searchResults,
    chapterData,
    isLoading,
    error,
    bookChapter,
    getBookChapter,
    selectedBook,
    getSelectedBookInfo,
    setSelectedBook,
    searchBook,
    fetchChapterImages,
    clearResults,
  };
};

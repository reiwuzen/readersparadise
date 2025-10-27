import { useDiscoverStore } from "@/store/useDiscoverStore";

export const useDiscover = () => {
  const getSearchRes = useDiscoverStore((s) => s.getSearchRes);
  const cacheSearchRes = useDiscoverStore((s) => s.getSearchRes);
  const getBook = useDiscoverStore((s) => s.getBook);
  const getChapter =useDiscoverStore((s)=>s.getChapter);
  return {
    getSearchRes,
    cacheSearchRes,
    getBook,
    getChapter,
  };
};

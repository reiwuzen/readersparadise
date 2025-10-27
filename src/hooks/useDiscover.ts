import { useDiscoverStore } from "@/store/useDiscoverStore";

export const useDiscover = () => {
  const getSearchRes = useDiscoverStore((s)=>s.getSearchRes);
  const cacheSearchRes = useDiscoverStore((s)=>s.getSearchRes)
  return {
    
getSearchRes,
cacheSearchRes
    
  };
};

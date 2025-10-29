import { create } from "zustand";
import { 
  // PageStruct,
   Series } from "@/types/seriesTypes";
import { UseDiscoverState } from "@/types/discoverTypes";
import { invoke } from "@tauri-apps/api/core";

export const useDiscoverStore = create<UseDiscoverState>((set,get)=>({
  getSearchRes:async (query)=>{
    let res = await invoke<Series[]>("search_book",{
      query,
    })
    set({
      SearchRes: res
    })
    return res
  },
  SearchRes: null,
  cacheSearchRes: async()=>{
    let z = get().SearchRes
    if(z === null) return;
    if(z.length === 0) return;
    await invoke("write_search_res_cache",{
      vecSeries: z
    })
    set((s)=>{
      return{
        ...s,
        SearchRes:null,
      }

    })
  },
  getBook:async(series)=>{
      let res = await invoke<Series>("get_book",{
        series
      });
      return res
  },
  getChapter: async(series,url)=>{
    let res = await invoke<Series>("get_chapter",{
      series,
      url
    })
    return res
  }
}))
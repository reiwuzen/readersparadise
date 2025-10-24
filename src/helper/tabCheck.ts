import { TabState } from "@/types/tabTypes";

export  function isDiscoverTab(tab?: TabState): tab is TabState<"discover"> {
  return tab?.type === "discover";
}
export function isBook(tab?: TabState) : tab is TabState<'book'>{
  return tab?.type === 'book'
}
export function isReader(tab?: TabState) : tab is TabState<'reader'>{
  return tab?.type === 'reader'
}
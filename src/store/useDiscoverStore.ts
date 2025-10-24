import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface SearchResult {
  source_name: string;
  title: string;
  cover_image: string | null;
  desc: string | null;
  link: string;
  latest_chapter: string | null;
}

export type EachChapter = {
  chapter_name: string | null;
  chapter_number: string | null;
  chapter_link: string | null;
};
export type BookChapter = {
  urls: string[];
  ch_no: string;
};
export type BookInfo = {
  title: string;
  type: string | null;
  cover_image: string;
  desc: string | null;
  author: string;
  status: string | null;
  bookmarks: string | null;
  created: string | null;
  update: string | null;
  chapters: EachChapter[];
  tags: string[];
};
export interface ChapterImageResult {
  cover: string | null;
  pages: string[];
  local_cache_paths: string[];
}

interface DiscoverState {
  sVal: string;
  setSVal: (inp: string) => void;
  searchResults: SearchResult[];
  chapterData: ChapterImageResult | null;
  isLoading: boolean;
  error: string | null;
  selectedBook: BookInfo | null;
  getSelectedBookInfo: (link: string, sourceName: string) => Promise<BookInfo>;
  setSelectedBook: (inp: BookInfo | null) => void;

  bookChapter: BookChapter | null;
  getBookChapter: (link: string, ch_no: string) => Promise<BookChapter>;
  setBookChapter: (inp:BookChapter|null)=>void;

  searchBook: (query: string) => Promise<SearchResult[]>;
  // fetchChapterImages: (url: string, source_name: string) => Promise<void>;
  clearResults: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  sVal: "",
  setSVal: (inp) =>
    set({
      sVal: inp,
    }),
  searchResults: [],
  chapterData: null,
  isLoading: false,
  error: null,
  selectedBook: null,
  bookChapter: null,
  getSelectedBookInfo: async (link, sourceName) => {
    let res = await invoke<BookInfo>("get_book_info", {
      link,
      sourceName,
    });
    return res
  },
  setSelectedBook: (inp) => {
    set({
      selectedBook: inp,
    });
  },

  // Search across all sources
  searchBook: async (query) => {
    if (!query.trim()) return [];

   
    try {
      const results = await invoke<SearchResult[]>("search_book", { query });
      return results
    } catch (err: any) {
      console.error("searchBook error:", err);
      
    }
    return []
  },
  getBookChapter: async (link, ch_no) => {
    let res = await invoke<BookChapter["urls"]>("get_book_chapter", {
      link,
    });
    return {urls: res, ch_no}
  },
  setBookChapter:(inp)=> set({
    bookChapter: inp
  }),
  // Fetch chapters and cache images locally

  // Reset results
  clearResults: () =>
    set({ searchResults: [], chapterData: null, error: null }),
}));

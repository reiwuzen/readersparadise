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
  urls:string[];
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
  searchResults: SearchResult[];
  chapterData: ChapterImageResult | null;
  isLoading: boolean;
  error: string | null;
  selectedBook: BookInfo | null;
  getSelectedBookInfo: (link: string, sourceName: string) => void;
  setSelectedBook: (inp: BookInfo) => void;

  bookChapter: BookChapter | null;
  getBookChapter: (link: string, ch_no:string) => void;

  searchBook: (query: string) => Promise<void>;
  fetchChapterImages: (url: string, source_name: string) => Promise<void>;
  clearResults: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
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
    set({
      selectedBook: res,
    });
  },
  setSelectedBook: (inp) =>
    set({
      selectedBook: inp,
    }),

  // Search across all sources
  searchBook: async (query) => {
    if (!query.trim()) return;

    set({ isLoading: true, error: null, searchResults: [] });
    try {
      const results = await invoke<SearchResult[]>("search_book", { query });
      set({ searchResults: results, isLoading: false });
    } catch (err: any) {
      set({
        error: err?.message || "Search failed",
        isLoading: false,
      });
      console.error("searchBook error:", err);
    }
  },
  getBookChapter: async (link, ch_no) => {
      let res = await invoke<BookChapter["urls"]>("get_book_chapter", {
        link
      });
      set({
        bookChapter: {urls:res, ch_no}
      })
  },
  // Fetch chapters and cache images locally
  fetchChapterImages: async (url, source_name) => {
    set({ isLoading: true, error: null });
    try {
      const result = await invoke<ChapterImageResult>("fetch_chapter_images", {
        url,
        sourceName: source_name,
      });
      set({ chapterData: result, isLoading: false });
    } catch (err: any) {
      set({
        error: err?.message || "Failed to fetch chapter images",
        isLoading: false,
      });
      console.error("fetchChapterImages error:", err);
    }
  },

  // Reset results
  clearResults: () =>
    set({ searchResults: [], chapterData: null, error: null }),
}));

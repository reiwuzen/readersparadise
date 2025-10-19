import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface SearchResult {
  source_name: string;
  manga_title: string;
  cover_img: string | null;
  desc: string | null;
  url: string;
}

export type selectedManga ={
  cover_img: String,
  title: String,
  desc: String,
  metaData: {
    Authors: String,
    Status: String,
    BookMarks: String,
    Created: String,
    Update: String,
  },
  chapters: {
    chapter_link: String,
  }[],

}
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
  selectedManga: selectedManga | null;
  getSelectedMangaInfo: (inp: String) => void;
  setSelectedManga: (inp: selectedManga) => void;

  searchManga: (query: string) => Promise<void>;
  fetchChapterImages: (url: string, source_name: string) => Promise<void>;
  clearResults: () => void;
}

export const useDiscoverStore = create<DiscoverState>((set) => ({
  searchResults: [],
  chapterData: null,
  isLoading: false,
  error: null,
  selectedManga: null,
  getSelectedMangaInfo: async (inp) => {
    await invoke("info_manga", {
      url: inp
    })
  },
  setSelectedManga: (inp) => set({
    selectedManga: inp
  }),

  // Search across all sources
  searchManga: async (query) => {
    if (!query.trim()) return;

    set({ isLoading: true, error: null, searchResults: [] });
    try {
      const results = await invoke<SearchResult[]>("search_manga", { query });
      set({ searchResults: results, isLoading: false });
    } catch (err: any) {
      set({
        error: err?.message || "Search failed",
        isLoading: false,
      });
      console.error("searchManga error:", err);
    }
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
  clearResults: () => set({ searchResults: [], chapterData: null, error: null }),
}));

import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs"; // for reading image files from paths
import { toast } from "sonner";
import { window_size, mid } from "./useReaderStore";
//useImportStore.ts
export type MangaFolder = {
  name: string;
  path: string;
  cover?: string; // base64 cover
  images: string[]; // now file paths, not bytes
  base64ByTab: Record<string, string[]>; // per-tab visible pages
  indexByTab: Record<string, number>; // per-tab page index
  mid: number;
};

// Converts Uint8Array → base64
const uint8ArrayToBase64 = async (
  data: Uint8Array<ArrayBuffer>,
  mime = "image/jpeg"
): Promise<string> => {
  // const clean = new Uint8Array(data.buffer.slice(0));
  const blob = new Blob([data], { type: mime });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
const readImageBytes = async (path: string) => {
  const bytes: number[] = await invoke<number[]>("read_image_bytes", { path });
  return new Uint8Array(bytes);
};

type ImportState = {
  mangas: MangaFolder[];
  setCurrentIndex: (
    bookName: string,
    currentIndex: number,
    mode: "prev" | "next"
  ) => void;
  importMangaFolder: () => Promise<void>;
  clearMangas: () => void;
  loadPageBatch: (
    mangaName: string,
    currentPageIndex: number,
    tabId: string
  ) => Promise<void>;
};
export const useImportStore = create<ImportState>((set, get) => ({
  mangas: [],
  setCurrentIndex: (bookName, currentIndex, mode) => {
    const { mangas } = get();
    const updatedCurrentBook =
      mode === "prev"
        ? mangas.map((m) =>
            m.name === bookName ? { ...m, currentIndex: currentIndex - 1 } : m
          )
        : mangas.map((m) =>
            m.name === bookName ? { ...m, currentIndex: currentIndex + 1 } : m
          );
    set({
      mangas: updatedCurrentBook,
    });
  },
  importMangaFolder: async () => {
    try {
      // result now returns { name, path, cover: Option<Vec<u8>>, images: Vec<String> }
      const result = await invoke<any>("open_folder_and_list_items");

      // Handle cover bytes if present
      const coverBytes = result.cover
        ? new Uint8Array(result.cover)
        : undefined;
      const coverBase64 = coverBytes
        ? await uint8ArrayToBase64(coverBytes)
        : undefined;

      const images: string[] = result.images; // file paths directly

      const newManga: MangaFolder = {
        name: result.name,
        path: result.path,
        cover: coverBase64,
        images,
        base64ByTab: {},
        indexByTab: {},
        mid: mid,
      };

      set((state) => ({ mangas: [...state.mangas, newManga] }));
      toast.success(`Imported "${result.name}"`, { duration: 1000 });
    } catch (error) {
      console.error("Import error:", error);
      toast.error(`Failed to import folder: ${error}`, { duration: 1500 });
    }
  },

  loadPageBatch: async (mangaName, currentPageIndex, tabId) => {
    const { mangas } = get();
    const manga = mangas.find((m) => m.name === mangaName);
    if (!manga) return;
    const safeIndex = Number.isFinite(currentPageIndex) ? currentPageIndex : 0;
    // Number of "null" placeholders at the start
    const numNull = Math.max(0, mid - safeIndex);

    // Prepare base array with "null" strings
    const base = new Array(window_size).fill("null");

    // Compute the starting index in manga.images to fill the base array
    const startIndex = Math.max(safeIndex - (mid - numNull), 0);
    
    // Fill base array with real images, respecting bounds
    for (
      let i = numNull, j = startIndex;
      i < window_size && j < manga.images.length;
      i++, j++
    ) {
      base[i] = manga.images[j]; // temporarily store path; can convert to base64 below
    }
  

    try {
      // Convert filled paths to base64, ignoring "null"
      const base64s = await Promise.all(
        base.map(async (imgPath) => {
          if (imgPath === "null") return "null";
          const bytes = await readImageBytes(imgPath);
          return await uint8ArrayToBase64(bytes);
        })
      );

      const updatedManga = {
        ...manga,
        base64ByTab: {
          ...manga.base64ByTab,
          [tabId]: base64s,
        },
        indexByTab: {
          ...manga.indexByTab,
          [tabId]: currentPageIndex,
        },
      };

      set((state) => ({
        mangas: state.mangas.map((m) =>
          m.name === mangaName ? updatedManga : m
        ),
      }));
    } catch (err) {
      console.error("Error loading image batch:", err);
      toast.error("Failed to load page batch", { duration: 1000 });
    }
  },

  clearMangas: () => set({ mangas: [] }),
}));

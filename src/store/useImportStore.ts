import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export type MangaFolder = {
  name: string;
  path: string;
  cover?: string; // now always base64 string if exists
  images: string[];
};

type ImportState = {
  mangas: MangaFolder[];
  importMangaFolder: () => Promise<void>;
  clearMangas: () => void;
};

const uint8ArrayToBase64 = (data: Uint8Array, mime = "image/jpeg"): string => {
  let binary = "";
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return `data:${mime};base64,` + window.btoa(binary);
};

export const useImportStore = create<ImportState>((set) => ({
  mangas: [],

  importMangaFolder: async () => {
    try {
      const result = await invoke<MangaFolder>("open_folder_and_list_items");

      const coverBytes = result.cover ? new Uint8Array(result.cover as any) : undefined;
      const coverBase64 = coverBytes ? uint8ArrayToBase64(coverBytes) : undefined;

      const newManga: MangaFolder = {
        name: result.name,
        path: result.path,
        cover: coverBase64,
        images: result.images,
      };

      set((state) => ({
        mangas: [...state.mangas, newManga],
      }));
    } catch (error) {
      toast.error(`Failed to import folder: ${error}`, { duration: 1000 });
      console.error("Failed to import folder:", error);
    }
  },

  clearMangas: () => set({ mangas: [] }),
}));

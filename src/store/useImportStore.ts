import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export type MangaFolder = {
  name: string;
  path: string;
  cover?: Uint8Array;
  images: string[];
};

type ImportState = {
  mangas: MangaFolder[];
  importMangaFolder: () => Promise<void>;
  clearMangas: () => void;
};

export const useImportStore = create<ImportState>((set, get) => ({
  mangas: [],

  // Open folder picker, get folder data from Rust, and add it to store
  importMangaFolder: async () => {
    try {
      const result = await invoke<MangaFolder>("open_folder_and_list_items");

      // Convert cover (Vec<u8>) into Uint8Array if present
      const coverBytes = result.cover ? new Uint8Array(result.cover as any) : undefined;

      const newManga: MangaFolder = {
        name: result.name,
        path: result.path,
        cover: coverBytes,
        images: result.images,
      };

      set((state) => ({
        mangas: [...state.mangas, newManga],
      }));
    } catch (error) {
        toast.error(`Failed to import folder: ${error}`,{
            duration: 1000
        })
      console.error("Failed to import folder:", error);
    }
  },

  clearMangas: () => set({ mangas: [] }),
}));
import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
// import { readFile } from "@tauri-apps/plugin-fs";
 // for reading image files from paths
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

  const blob = new Blob([data], { type: mime });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
//
const base64ToImg = (base64: string, mime= 'image/jpeg') =>{
  return `data:${mime};base64,${base64}`
}
//
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
    tabId: string,
    prevBase64: string[]
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

  loadPageBatch: async (mangaName, currentPageIndex, tabId, prevBase64) => {
    const a = Date.now()
    const { mangas } = get();
    // const a1 = Date.now(); console.log(`time to get mangas: ${a1-a}`)
    const manga = mangas.find((m) => m.name === mangaName);
    // const a2 = Date.now(); console.log(`time to find specific manga: ${a2-a1}`)
    if (!manga) return;

    const A = manga.images;
    const N = A.length;
    const windowSize = window_size;
    const mid = Math.floor(windowSize / 2);

    const lastIndex = manga.indexByTab[tabId] ?? 0;
    const diff = currentPageIndex - lastIndex;

    // clone mutable base64 window
    let mutPrevBase64 = [...(prevBase64 || [])];

    // --- Small forward scroll within window ---
    const a3 =Date.now()
    if (diff > 0 && diff <= mid) {
      const s = Date.now();
      for (let i = 0; i < diff; i++) {
        // console.log(`time from 123 to 125 line: ${Date.now()-s}`)
        const z = Date.now();
        mutPrevBase64=mutPrevBase64.slice(1);
        // console.log(`time for slicing: ${Date.now()-z}`)
        const nextIndex = currentPageIndex + mid - (diff - i - 1);
        const g =Date.now();
        if (nextIndex >= N) {
          const s = Date.now();
          mutPrevBase64.push("null");
          // console.log(`time for one push or inside if: ${Date.now()-s}`)
        } else {
          const t = Date.now()
          const bytes = await invoke<string>("read_image_base64", {
            path: A[nextIndex],
          });
          // console.log(`time for invoke function: ${Date.now()-t}`)
          const x = Date.now();
          mutPrevBase64.push(base64ToImg(bytes));
          const y =Date.now()
          // console.log(`time to load one image: ${y-x}`)
          // console.log(`time for inside: else: ${Date.now()-t}`)
        }
        const h =Date.now()
        // console.log(`time for inside if else : ${h-g}`)
      }const a4 =Date.now(); console.log(`time for from before if block: ${a4-a3}`);
      // console.log(`time for if block: ${a4-s}`);
    }

    // --- Small backward scroll within window ---
    else if (diff < 0 && Math.abs(diff) <= mid) {
      const s = Date.now();
      for (let i = 0; i < Math.abs(diff); i++) {
        const s = Date.now();
        mutPrevBase64.pop();
        // console.log(`time for one pop: ${Date.now()-s}}`)
        const prevIndex = currentPageIndex - mid + i;
        const g =Date.now();
        if (prevIndex < 0) {
          const temp =mutPrevBase64;
          mutPrevBase64= ['null', ...temp];
        } else {
          const t =Date.now()
          const bytes = await invoke<string>("read_image_base64", {
            path: A[prevIndex],
          });
          const x =Date.now();
          // console.log(`time for invoke: ${x-t}`)
          const temp =mutPrevBase64;
          mutPrevBase64= [base64ToImg(bytes), ...temp]
          const y =Date.now()
          // console.log(`time to load one image: ${y-x}`)
          // console.log(`time for inside else : ${y-t}`)
        }
        // console.log(`time for inside if else block: ${Date.now()-g}`)
      }
      // const a5 = Date.now(); console.log(`time for else if block : ${a5-a3}`);
      // console.log(`time for else if block: ${a5-s}`);
    }

    // --- Large jump or cold load ---
    else {
      const start = currentPageIndex - mid;
      const end = currentPageIndex + (windowSize - mid);
      const paths: string[] = [];

      for (let i = start; i < end; i++) {
        if (i < 0 || i >= N) paths.push("null");
        else paths.push(A[i]);
      }
      const x =Date.now();
      const base64s = await Promise.all(
        paths.map(async (imgPath) => {
          if (imgPath === "null") return "null";
          const bytes = await invoke<string>("read_image_base64", {
            path: imgPath,
          });
          return base64ToImg(bytes);
        })
      );
      const y =Date.now()
          // console.log(`time to load whole images from else image: ${y-x}`)

      mutPrevBase64 = base64s;
      // const a6 =Date.now(); console.log(`time for else block: ${a6-a3}`)
    }

    // ✅ Always update store when done
    const updatedManga = {
      ...manga,
      base64ByTab: {
        ...manga.base64ByTab,
        [tabId]: mutPrevBase64,
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
    const e = Date.now();
    // console.log(`time to do the whole function: ${e-a}`)
    // console.log(`--------------------------------------`)
  },

  clearMangas: () => set({ mangas: [] }),
}));

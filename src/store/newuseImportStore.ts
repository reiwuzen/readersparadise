import { create } from "zustand";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir as appDir, join } from "@tauri-apps/api/path";
import { readTextFile, writeFile, exists,mkdir,
  //  create as fsCreate 
  } from "@tauri-apps/plugin-fs";

type ImportedData = {
  path: string;
  type: "external" | "internal";
  timestamp: number;
};

type ImportStore = {
  imported: ImportedData[];
  isLoading: boolean;
  importType: "external" | "internal" | null;
  importData: (type: "external" | "internal") => Promise<void>;
  reclaimImports: () => Promise<void>;
};

export const IMPORT_FILE = "imported/data/imported.json";

export const useImportStore = create<ImportStore>((set, get) => {
  const saveToFile = async (importedData: ImportedData[]) => {
    try {
      const dir = await appDir();
      const jsonPath = await join(dir, IMPORT_FILE);

      // Manually ensure nested directories exist
      const parts = jsonPath.split("/"); 
      for (let i = 1; i <= parts.length - 1; i++) {
        const pathToCheck = parts.slice(0, i + 1).join("/");
        if (!(await exists(pathToCheck))) {
          await mkdir(pathToCheck);
        }
      }

      // Convert JSON string to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(importedData, null, 2));

      // Write the file
      await writeFile(jsonPath, data);
    } catch (err) {
      console.error("Failed to save imports:", err);
    }
  };

  return {
    imported: [],
    isLoading: false,
    importType: null,

    importData: async (type) => {
      set({ isLoading: true, importType: type });
      try {
        let result: string | null = null;

        if (type === "external") {
          result = await invoke<string>("select_folder_and_register");
        } else if (type === "internal") {
          result = await invoke<string>("import_selected_folder");
        }

        if (!result) {
          toast.error("No folder selected");
          set({ isLoading: false });
          return;
        }

        const newData: ImportedData = { path: result, type, timestamp: Date.now() };
        const updated = [...get().imported, newData];
        set({ imported: updated });

        // Auto-save to JSON
        await saveToFile(updated);

        toast.success(`Imported from ${type} successfully!`);
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to import: ${err.message || err}`);
      } finally {
        set({ isLoading: false });
      }
    },

    reclaimImports: async () => {
      try {
        const dir = await appDir();
        const jsonPath = await join(dir, IMPORT_FILE);

        if (!(await exists(jsonPath))) return;

        const content = await readTextFile(jsonPath);
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          set({ imported: parsed });
          toast.info(`Recovered ${parsed.length} imports`);
        }
      } catch (err) {
        console.error("Reclaim error:", err);
      }
    },
  };
});

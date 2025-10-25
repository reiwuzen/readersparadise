import { create } from "zustand";
import { UserConf, UseUserState } from "@/types/userTypes";
import { invoke } from "@tauri-apps/api/core";

const getConfig = async (): Promise<UserConf> => {
  return await invoke<UserConf>("get_user_config");
};

export const useUserStore = create<UseUserState>((set) => ({
  config: null,

  // Sets config both locally and remotely
  setConfig: async (data: Partial<UserConf>) => {
    try {
      await invoke("update_user_config", { updates: data });
      const updatedConfig = await getConfig();
      set({ config: updatedConfig });
    } catch (err) {
      console.error("Failed to update config:", err);
    }
  },

  // Loads config from backend
  loadConfig: async () => {
    try {
      const config = await getConfig();
      set({ config });
    } catch (err) {
      console.error("Failed to load config:", err);
    }
  },
}));

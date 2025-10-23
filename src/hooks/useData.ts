import { invoke } from "@tauri-apps/api/core";

export const useData = () => {
    const getAppPath = async ():Promise<string> => await invoke("get_app_path");
    const clearData = async () => await invoke("reset_data_dir");
    const clearDownloads = async () => await invoke("reset_downloads_dir");
    const clearSource = async() => await invoke("reset_src_dir");
    const clearCache = async() => await invoke("reset_cache_dir");
    return{
        getAppPath,
        clearData,
        clearDownloads,
        clearSource,
        clearCache,
    }
};
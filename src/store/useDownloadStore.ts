import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
export type DownloadState = {
  download1Chapter: (
    book_name: string,
    ch_no: string,
    ch_urls: string[]
  ) => void;
};
export const useDownloadStore = create<DownloadState>((
  // set
) => ({
  download1Chapter: async(book_name,ch_no,ch_urls) => {
     await invoke("download_1_chapter",{
        bookName:book_name,
        chNo:ch_no,
        chUrls:ch_urls,
    })
  },
}));

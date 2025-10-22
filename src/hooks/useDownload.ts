import { useDownloadStore } from "@/store/useDownloadStore";

export const useDownload = () => {
    const download1Chapter = useDownloadStore((s)=>s.download1Chapter);
    return{
        download1Chapter,
    }
}
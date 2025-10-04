import { useImportStore } from "@/store/useImportStore";
export const useImport = () => {
    const importMangaFolder = useImportStore((state) => state.importMangaFolder);
    const mangas = useImportStore((state) => state.mangas);
    const clearMangas = useImportStore((state) => state.clearMangas);
    return {
        importMangaFolder,
        mangas,
        clearMangas,
    };
}
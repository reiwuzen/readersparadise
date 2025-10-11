import { useSettingsStore } from "@/store/useSettingsStore";
export const useSettings = () => {
    const items = useSettingsStore((state) => state.items);
    const setItemActive = useSettingsStore((state) => state.setItemActive);
    const theme = useSettingsStore((state) => state.theme);
    const setTheme = useSettingsStore((state) => state.setTheme);
    const initTheme = useSettingsStore((s)=> s.initTheme);
    const pageLayout = useSettingsStore((s)=>s.pageLayout);
    const setPageLayout = useSettingsStore((s)=> s.setPageLayout);
    const scrollDirection =useSettingsStore((s)=> s.scrollDirection);
    const setScrollDirection =useSettingsStore((s)=>s.setScrollDirection);
    const defaultViewMode = useSettingsStore((state) => state.defaultViewMode);
    const setDefaultViewMode = useSettingsStore((state) => state.setDefaultViewMode);
    const showNSFW = useSettingsStore((state) => state.showNSFW);
    const toggleNSFW = useSettingsStore((state) => state.toggleNSFW);
    const libraryPath = useSettingsStore((state) => state.libraryPath);
    const setLibraryPath = useSettingsStore((state) => state.setLibraryPath);
    const activeItem = items.find((item) => item.isItemActive);
    return {
        items,
        setItemActive,
        theme,
        setTheme,
        initTheme,
        pageLayout,
        setPageLayout,
        scrollDirection,
        setScrollDirection,
        activeItem,
        defaultViewMode,
        setDefaultViewMode,
        showNSFW,
        toggleNSFW,
        libraryPath,
        setLibraryPath,
    };
}
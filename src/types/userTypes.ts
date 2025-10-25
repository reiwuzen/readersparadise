// import { invoke } from "@tauri-apps/api/core";
// import { themeType } from "./useSettingsStore";
// ------------------- Enums -------------------

 type Theme = "Dark" | "Light" | "BlueGrey" | "Custom";
import { themeType } from "@/store/useSettingsStore";
import { PageLayout as pl } from "@/store/useSettingsStore";
 type ReaderMode =
  | "TopToBottom"
  | "BottomToTop"
  | "LeftToRight"
  | "RightToLeft";
import { ScrollDirec } from "@/store/useSettingsStore";
export const USER_TO_SETTING_SCROLL_DIRECTION : Record<ReaderMode, ScrollDirec>={
    TopToBottom: "ttb",
    BottomToTop: 'btt',
    LeftToRight: 'ltr',
    RightToLeft:'rtl',
}
export type PageLayout = "Single" | "Double";
export const USER_TO_SETTING_PAGE_LAYOUT: Record<PageLayout,pl> ={
    Single: "single",
    Double: "double"
,}
export const USER_TO_SETTING_THEME : Record<Theme,themeType> = {
    Dark: "dark",
    Light: 'light',
    Custom: 'custom',
    BlueGrey: "blueGrey",
}
// ------------------- Structs -------------------

 interface DownloadConf {
  path: string;            // PathBuf serialized as string
  concurrent_limit: number;
}

 interface ReaderConf {
  page_layout: PageLayout;
  mode: ReaderMode;
  keyboard_shortcuts: boolean;
}

export interface UserConf {
  is_nsfw: boolean;
  theme: Theme;
  app_path: string;        // PathBuf serialized as string
  download: DownloadConf;
  reader: ReaderConf;
}

export type UseUserState={
    config: UserConf | null;
    setConfig: (data: object)=> void;
    loadConfig: ()=>void;
}
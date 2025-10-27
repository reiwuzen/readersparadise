import LibraryTab from "@/components/tabs/libraryTab/libraryTab";
import DiscoverTab from "@/components/tabs/discoverTab/discoverTab";
import SettingsTab from "@/components/tabs/settingsTab/settingsTab";
import Reader from "@/components/reader/Reader";
import Book from "@/components/book/book";
import About from "@/components/about/About";
// import { BookInfo, SearchResult } from "@/store/useDiscoverStore";

import { Mode } from "./globalTypes";
import { Series } from "./seriesTypes";

/**
 * Tab Components Mapping
 */

export const TAB_COMPONENTS = {
  library: LibraryTab,
  discover: DiscoverTab,
  settings: SettingsTab,
  reader: Reader,
  about: About,
  book: Book,
} as const;

export type TabComponentMap = typeof TAB_COMPONENTS;
export type TabType = keyof TabComponentMap;

/**
 * Tab-specific data shapes
 */
export type DiscoverData = {
  query: string;
  searchResults: Series[];
  isLoading?: boolean;
  error?: string | null;
};

export type ReaderData = {
  bookId?: string;
  chapterId?: string;
  urls?:string[];
  pages?: string[];
  currentPage?: number;
};

export type BookData = {
  series: Series
};

export type DownloadsData = {
  activeDownloads: string[];
  completedDownloads: string[];
};

/**
 * Mapping of tab types to their data structures
 */
export type TabDataMap = {
  library: {};
  discover: DiscoverData;
  settings: {};
  reader: ReaderData;
  about: {};
  book: BookData;
};

/**
 * A single tab’s data payload
 */
export type url_s = string & { __brand: "full or partial url" };
export type tab_id_s = string & { __brand: "crypto_id" };
export type i_n = number & { __brand: "index_number" };
export type TabState<T extends TabType = TabType> = {
  name: string;
  type: T;
  get content(): TabComponentMap[T];
  url: url_s;
  data: TabDataMap[T];
};

/**
 * Core Tab Object
 */
export type Tab<T extends TabType = TabType> = {
  id: tab_id_s;
  index: i_n;
  get activeData(): TabState<T>;
  states: TabState<T>[];
};

/**
 * Tabs Store / State
 */
export type UseTabsState = {
activeTabId: tab_id_s;
  tabs: Tab[];
  recentTabs: Tab[];
  timeLineOfActiveTabId: tab_id_s[];

  // methods
  setT_L_O_A_T_ID: (id: tab_id_s, mode: Mode) => void;
  addTab: (type: TabType, data: TabDataMap[typeof type]) => void;
  closeTab: (id: tab_id_s) => void;
  switchTab:(id:tab_id_s)=>void;
  changeTabPage:(id:tab_id_s, data:TabState)=>void;
  openRecentTab: (id: tab_id_s) => void;
  closeRecentTab: (id: tab_id_s) => void;
  duplicateTab: (id: tab_id_s) => void;
  updateTabData: (id: tab_id_s, mode: Mode, newData: TabState) => void;
  goBack: (id:tab_id_s) => void;
  goForward: (id:tab_id_s) => void;
};

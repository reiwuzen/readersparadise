// import { create } from "zustand";
// // import { BaseDirectory, readDir, readTextFile, writeFile, exists, mkdir } from "@tauri-apps/plugin-fs";
// // import { useImportStore } from "./newuseImportStore"; 

// type Page = string;

// type Chapter = {
//   path: string;
//   chapterPages: Page[];
//   chapterPagesNum: number;
// };

// type Book = {
//   path: string;
//   type: "external" | "internal";
//   chapters: Chapter[];
// };

// type BookState = {
//   bookStore: Book[];
//   loadBooks: () => Promise<void>;
// };

// const BOOK_STORE_FILE = "data/bookStore.json";

// export const useBookState = create<BookState>((set, get) => ({
//   bookStore: [],

//   loadBooks: async () => {
   
//   },
// }));

// store.ts
import { create } from "zustand";

type SourceState = {
  selected: string[];
  toggleSource: (src: string) => void;
};

const useSourceStore = create<SourceState>((set) => ({
  selected: [],
  toggleSource: (src) =>
    set((state) => ({
      selected: state.selected.includes(src)
        ? state.selected.filter((s) => s !== src)
        : [...state.selected, src],
    })),
}));
export default useSourceStore;
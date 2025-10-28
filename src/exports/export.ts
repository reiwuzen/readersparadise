// // import { useTabs } from "@/hooks/useTabs";
// import { create } from "zustand";

// type ExportState={
//     isTab: boolean;
//     setIsTab: ()=> void;
// }
// const isTab = (): boolean => {
//     // const {tabs} =useTabs();
//     // return (tabs.length !== 0)
// }

// export const useExportStore = create<ExportState>((set,get)=>({
    
//     isTab: isTab(),
//     setIsTab: () => {
//         const t = isTab();
//         set(({
//             isTab: t,
//         }))
//     }
// }))
import {
    //  PageStruct, 
    Series } from "./seriesTypes"

export type UseDiscoverState = {
    getSearchRes: (query: String)=> Promise<Series[]>
    SearchRes: Series[] | null;
    cacheSearchRes: ()=> void;
    getBook:(series: Series)=> Promise<Series>;
    getChapter:(series: Series ,url:string)=> Promise<Series>;
}
import { Series } from "./seriesTypes"

export type UseDiscoverState = {
    getSearchRes: (query: String)=> Promise<Series[]>
    SearchRes: Series[] | null;
}
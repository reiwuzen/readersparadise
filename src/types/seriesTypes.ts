// ---------- ENUMS ----------

export enum SitesEnum {
  Mgeko = "Mgeko",
  EHentai = "EHentai",
  Hentai2Read = "Hentai2Read",
  HentaiRead = "HentaiRead",
  HentaiFox = "HentaiFox",
}

export enum AvailabilityStatus {
  Downloaded = "Downloaded",
  Downloading = "Downloading",
  Queued = "Queued",
  Failed = "Failed",
  Online = "Online",
}

export enum SeriesStatusEnum {
  Ongoing = "Ongoing",
  Stopped = "Stopped",
  Completed = "Completed",
  Hiatus = "Hiatus",
}

// ---------- INTERFACES ----------

export interface AttrItemStruct {
  name: string;
  url: string;
  path: string;
}

export interface PageStruct {
  order: number;
  url: string;
  path: string;
  availability: AvailabilityStatus;
  is_read: boolean;
}

export interface ChapterStruct {
  order: number;
  title?: string;
  url: string;
  path: string;
  pages: PageStruct[];
}

export interface AttributeStruct {
  status: SeriesStatusEnum;
  authors: AttrItemStruct;
  tags: AttrItemStruct[];
  category: AttrItemStruct;
}

export interface Series {
  id: string;
  site: SitesEnum;
  title: string;
  alt_title: string;
  cover_img_url: string;
  chapter_count: number;
  desc: string;
  favorite: boolean;
  reads: number;
  all_chapters_url: string,
  availability: AvailabilityStatus;
  chapters: ChapterStruct[];
  attributes: AttributeStruct;
}

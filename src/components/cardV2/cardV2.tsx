import './cardV2.scss';
import { SearchResult } from '@/store/useDiscoverStore';
export type CardV2Props = {
    i: number;
    manga: SearchResult;
}

const CardV2 = ({manga, i}: CardV2Props) => {
    return (
        <div
                key={i}
                className="manga-card"
                // onClick={() => fetchChapterImages(manga.url, manga.source_name)}
              >
                <img
                  src={manga.cover_img ?? ""}
                  alt={manga.manga_title}
                  className="cover"
                />
                <div className="info">
                  <h4 className="title">{manga.manga_title}</h4>
                  <p className="source">{manga.source_name}</p>
                  {manga.desc && (
                    <p className="desc">{manga.desc.slice(0, 80)}...</p>
                  )}
                </div>
              </div>
    )
}
export default CardV2;
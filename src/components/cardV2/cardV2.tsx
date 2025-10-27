import "./cardV2.scss";
// import { SearchResult } from "@/store/useDiscoverStore";
import { Series } from "@/types/seriesTypes";
import { useDiscover } from "@/hooks/useDiscover";
import { useActiveTab } from "@/hooks/useActiveTab";
import { createTabState } from "@/store/useTabsStore";
// import { BookData } from "@/types/tabTypes";
// import { useActiveTab } from "@/hooks/useActiveTab";

export type CardV2Props = {
  i: number;
  Book: Series;
};

const CardV2 = ({ Book, i }: CardV2Props) => {
  const { changeActiveTabPage } = useActiveTab();
  const { getSelectedBookInfo } = useDiscover();

  const handleClick = async () => {
  if (!Book || !Book.title) return;

  const encodedTitle = encodeURIComponent(Book.title);

  // Fetch book data properly
  // const bookData = await getSelectedBookInfo(Book.link, Book.source_name);

  // Open a new tab with the resolved book data
  // changeActiveTabPage(createTabState('book', Book.title, `/book/${Book.title}`, bookData));
};

  return (
    <div key={i} className="book-card" onClick={handleClick}>
      <img
        src={Book.cover_img_url ?? ""}
        alt={Book.title}
        className="cover"
        loading="lazy"
      />

      <div className="info">
        <h4 className="title">{Book.title}</h4>
        <p className="source">{Book.site}</p>

        {Book.desc && (
          <p className="desc">
            {Book.desc.length > 80 ? `${Book.desc.slice(0, 80)}...` : Book.desc}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardV2;

import "./cardV2.scss";
import { SearchResult } from "@/store/useDiscoverStore";
import { useDiscover } from "@/hooks/useDiscover";
import { useActiveTab } from "@/hooks/useActiveTab";

export type CardV2Props = {
  i: number;
  Book: SearchResult;
};

const CardV2 = ({ Book, i }: CardV2Props) => {
  const { pushNewMeta } = useActiveTab();
  const { getSelectedBookInfo } = useDiscover();

  const handleClick = () => {
    if (!Book || !Book.title) return;

    const encodedTitle = encodeURIComponent(Book.title);

    // ✅ Push new metadata for the Book tab (adds new tab history entry)
    pushNewMeta(Book.title, encodedTitle, "book", undefined, {
      selectedBook: Book,
    });

    // ✅ Fetch full book info
    getSelectedBookInfo(Book.link, Book.source_name);
  };

  return (
    <div key={i} className="book-card" onClick={handleClick}>
      <img
        src={Book.cover_image ?? ""}
        alt={Book.title}
        className="cover"
        loading="lazy"
      />

      <div className="info">
        <h4 className="title">{Book.title}</h4>
        <p className="source">{Book.source_name}</p>

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

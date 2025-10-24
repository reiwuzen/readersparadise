import "./book.scss";
import { useState } from "react";
import { useDiscover } from "@/hooks/useDiscover";
// import { useActiveTab } from "@/hooks/useActiveTab";

const Book = () => {
  const { selectedBook, getBookChapter } = useDiscover();
  // const { activeTabId, pushNewMeta } = useActiveTab();
  const [is, setIs] = useState(true);

  const book = selectedBook;

  if (!book) {
    return (
      <div className="book">
        <p className="status-msg">No book selected.</p>
      </div>
    );
  }

  const handleChapterClick = (chapter: any) => {
    if (!chapter?.chapter_number) return;

    const chapterNumber = chapter.chapter_number ?? "";
    const chapterUrl = `${book.title}/${chapterNumber}`;

    // Push new metadata for Reader tab (new history entry)
    // pushNewMeta(book.title, chapterUrl, "reader", undefined, {
    //   selectedBook: book,
    //   bookChapter: {
    //     chapter_number: chapterNumber,
    //     chapter_link: chapter.chapter_link,
    //   },
    // });

    // Trigger actual chapter loading
    getBookChapter(chapter.chapter_link ?? "", chapterNumber);
  };

  return (
    <div className="book">
      {/* --- Book Metadata --- */}
      <div className="metaData">
        <div className="metaImg">
          <img src={book.cover_image} alt={book.title} />
        </div>

        <div className="metaInfo">
          <h2 className="title">{book.title}</h2>

          <aside className="author">
            <strong>Author(s):&nbsp;</strong>
            <strong>{book.author}</strong>
          </aside>

          <aside className="bookmarks">
            <strong>Bookmarks:&nbsp;</strong>
            <strong>{book.bookmarks}</strong>
          </aside>

          <aside className="status">
            <strong>Status:&nbsp;</strong>
            <strong>{book.status}</strong>
          </aside>

          <div className="metaTags">
            <h4>Tags / Categories:</h4>
            <ul className="tags">
              {book.tags.map((t: string, i: number) => (
                <li key={i}>
                  <p>{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* --- Tabs (Overview / Chapters) --- */}
      <div className="metaOthers">
        <aside className="tab-pane">
          <h3 className={is ? "_tab" : ""} onClick={() => setIs(true)}>
            Overview
          </h3>
          <h3 className={!is ? "_tab" : ""} onClick={() => setIs(false)}>
            Chapters
          </h3>
        </aside>

        <aside className="data">
          {is ? (
            <div className="synopsis">
              <h4>Synopsis</h4>
              <p>{book.desc}</p>
            </div>
          ) : (
            <div className="metaChapters">
              <h4>Chapters:&nbsp;</h4>
              <ul className="chapters">
                {book.chapters.map((c: any, i: number) => (
                  <li
                    key={i}
                    title={c.chapter_number ?? ""}
                    onClick={() => handleChapterClick(c)}
                  >
                    <p>{c.chapter_number}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Book;

import "./book.scss";
import { useState } from "react";
import { useDiscover } from "@/hooks/useDiscover";
import { useActiveTab } from "@/hooks/useActiveTab";
import { createTabState } from "@/store/useTabsStore";
import { isBook } from "@/helper/tabCheck";
import { BookData } from "@/types/tabTypes";
import { AttrItemStruct, ChapterStruct } from "@/types/seriesTypes";
// import { BookInfo } from "@/store/useDiscoverStore";
const Book = () => {
  const {  getChapter } = useDiscover();
  const { changeActiveTabPage, activeTabData } = useActiveTab();
  const [is, setIs] = useState(true);

  // const book = selectedBook;
  const book = isBook(activeTabData)? activeTabData.data  : {} as BookData
  if (!book) {
    return (
      <div className="book">
        <p className="status-msg">No book selected.</p>
      </div>
    );
  }

  const handleChapterClick =async (chapter: ChapterStruct) => {
    if (!chapter?.title) return;

    const chapterNumber = chapter.title ?? "";
    const chapterUrl = `${book.series.title}/${chapterNumber}`;

    
    const pgs = await getChapter(book.series,chapter.url);
    changeActiveTabPage(createTabState('reader',book.series.title,`/reader/${chapterUrl}`,{
      urls: pgs.chapters.find((z)=>z.url === chapter.url)?.pages.map((z)=>z.url) ?? [] as string[],
      chapterId: chapter.title,
      bookId: book.series.title
    }))

    // Trigger actual chapter loading
  };

  return (
    <div className="book">
      {/* --- Book Metadata --- */}
      <div className="metaData">
        <div className="metaImg">
          <img src={book.series.cover_img_url} alt={book.series.title} />
        </div>

        <div className="metaInfo">
          <h2 className="title">{book.series.title}</h2>

          <aside className="author">
            <strong>Author(s):&nbsp;</strong>
            <strong>{book.series.attributes.authors.name}</strong>
          </aside>

          {/* <aside className="bookmarks">
            <strong>Bookmarks:&nbsp;</strong>
            <strong>{book.bookmarks}</strong>
          </aside> */}

          <aside className="status">
            <strong>Status:&nbsp;</strong>
            <strong>{book.series.attributes.status}</strong>
          </aside>

          <div className="metaTags">
            <h4>Tags / Categories:</h4>
            <ul className="tags">
              {book.series.attributes.tags.map((t: AttrItemStruct, i: number) => (
                <li key={i}>
                  <p>{t.name}</p>
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
              <p>{book.series.desc}</p>
            </div>
          ) : (
            <div className="metaChapters">
              <h4>Chapters:&nbsp;</h4>
              <ul className="chapters">
                {book.series.chapters.map((t:ChapterStruct, i: number) => (
                  <li
                    key={i}
                    title={t.title ?? ""}
                    onClick={() => handleChapterClick(t)}
                  >
                    <p>{t.title}</p>
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

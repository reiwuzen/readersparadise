import "./book.scss";
import { useState } from "react";
import { useDiscover } from "@/hooks/useDiscover";
import { useTabs } from "@/hooks/useTabs";
import { useActiveTab } from "@/hooks/useActiveTab";
// import { useActiveTab } from "@/hooks/useActiveTab";

const Book = () => {
  const {activeTabId} =useActiveTab();
  const {changeTab} =useTabs();
  const { selectedBook, getBookChapter } = useDiscover();
  const [is, setIs] = useState(true);
  // const {activeMetaData} = useActiveTab();
  let book = selectedBook;
  if (book !== null) {
    console.log(book); //debug

    return (
      <div className="book">
        <div className="metaData">
          <div className="metaImg">
            <img src={book.cover_image} alt={book.title} />
          </div>
          <div className="metaInfo">
            <h2 className="title">{book.title}</h2>
            <aside className="author">
              <strong>Author(s) :&nbsp;</strong>
              <strong>{book.author}</strong>
            </aside>
            <aside className="bookmarks">
              <strong>Bookmarks :&nbsp;</strong>
              <strong>{book.bookmarks}</strong>
            </aside>
            <aside className="status">
              <strong>Status :&nbsp;</strong>
              <strong>{book.status}</strong>
            </aside>
            <div className="metaTags">
              <h4>Tags/Categories:</h4>
              <ul className="tags">
                {book.tags.map((t, i) => (
                  <li key={i}>
                    <p>{t}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="metaOthers">
          <aside className="tab-pane">
            <h3 className={`${is ? "_tab" : ""}`} onClick={() => setIs(true)}>
              Overview
            </h3>
            <h3 className={`${!is ? "_tab" : ""}`} onClick={() => setIs(false)}>
              Chapters
            </h3>
          </aside>
          <aside className="data">
            {is ? (
              <>
                <div className="synopsis">
                  <h4>Synopsis</h4>
                  <p>{book.desc}</p>
                </div>
              </>
            ) : (
              <div className="metaChapters">
                <h4>Chapters :&nbsp;</h4>
                <ul className="chapters">
                  {book.chapters.map((c, i) => (
                    <li key={i} title={c.chapter_number ?? ""} onClick={()=>{
                      if(c.chapter_number)
                      changeTab(activeTabId, `${book.title}`, 'reader', `${book.title}/${c.chapter_number ?? ""}`);
                      getBookChapter(c.chapter_link ?? "", c.chapter_number ?? "")}}>
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
  }
};
export default Book;

import "./bookInfo.scss";

import { useDiscover } from "@/hooks/useDiscover";

const BookInfo = () => {
  const { selectedBook } = useDiscover();
  let book_info = selectedBook;
  if (book_info !== null) {
    console.log(book_info); //debug

    return (
      <div className="bookInfo">
        <div>
          <div className="metaData">
            <div>
              <img
                src={`${book_info.cover_image}`}
                alt={`${book_info.title}`}
              />
            </div>
            <button>READ NOW</button>
            <ul>
              <li>
                <p>Authors:</p>
                <p>{book_info.author}</p>
              </li>
              <li>
                <p>Status:</p>
                <p>{book_info.status}</p>
              </li>
              <li>
                <p>Type:</p>
                <p>{book_info.type}</p>
              </li>
              <li>
                <p>Bookmarks:</p>
                <p>{book_info.bookmarks}</p>
              </li>
              <li>
                <p>Created:</p>
                <p>{book_info.created}</p>
              </li>
              <li>
                <p>Update:</p>
                <p>{book_info.update}</p>
              </li>
            </ul>
          </div>
          <div className="bookData">
            <h3>{book_info.title}</h3>
            <ul className="bTags">
              {book_info.tags.length > 0
                ? book_info.tags.map((tag, i) => <li key={i}>{tag}</li>)
                : (<p>No tags Available</p>)}
            </ul>
            <p id="uniq">Description :</p>
            <p>{book_info.desc}</p>
            <div className="bookChapters">
              <h4>Chapters</h4>
              <input type="search" name="" id="ChapterSearch" />
              <ul className="chapterInfo">
                {book_info.chapters.map((chapter, i) => (
                  <li key={i}>{chapter.chapter_number}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
export default BookInfo;

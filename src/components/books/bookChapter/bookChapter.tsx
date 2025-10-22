import { useDiscover } from "@/hooks/useDiscover";
import "./bookChapter.scss";

const BookChapter = () => {
  const { bookChapter } = useDiscover();
  //   let book_info = selectedBook;
  return (
    <ul className="bookChapter">
      {bookChapter && bookChapter.urls.length > 0 ? (
        bookChapter.urls.map((url, i) => (
          <li key={i}>
            <img src={url} alt={`Page ${i + 1}`} />
          </li>
        ))
      ) : (
        <p>Does not exist</p>
      )}
    </ul>
  );
};
export default BookChapter;

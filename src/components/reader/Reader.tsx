import "./Reader.scss";
import { useDiscover } from "@/hooks/useDiscover";
const Reader = () => {
  const { bookChapter, selectedBook } = useDiscover();
  let book = selectedBook;
  let chapter = bookChapter;
  return (
    <div className="reader">
      <div className="heading">
        {book && book.title && chapter?.ch_no && (
          <h3>
            {book.title}/{chapter.ch_no}
          </h3>
        )}
        {book && book.title && !chapter?.ch_no && <h3>{book.title}/</h3>}
      </div>
      <ul className="pages">
        {chapter && chapter.urls && chapter.urls.map((u,i)=>(
          <li key={i}>
            <img src={u} alt={`Page no: ${i}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Reader;

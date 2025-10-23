import { useState } from "react";
import "./Reader.scss";
import { useDiscover } from "@/hooks/useDiscover";
const Reader = () => {
  const { bookChapter, selectedBook } = useDiscover();
  let book = selectedBook;
  let chapter = bookChapter;
    const [zoom, setZoom] = useState(1);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3)); // limit to 3x
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5)); // min 0.5x
  const resetZoom = () => setZoom(1);
  const handleWheel = (e: React.WheelEvent) => {
  if (e.ctrlKey) { // Ctrl + scroll
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }
};
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
      <ul className="pages"  onWheel={handleWheel}
  >
        {chapter && chapter.urls && chapter.urls.map((u,i)=>(
          <li key={i} >
            <img src={u} alt={`Page no: ${i}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Reader;

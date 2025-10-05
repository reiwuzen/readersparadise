import "./Reader.scss";
import { useRef, useEffect, useState } from "react";
import { useReader } from "@/hooks/useReader";
// import { toast } from 'sonner';

const Reader = () => {
  const [open, setOpen] = useState<boolean>(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const { currentBook } = useReader();
  let k = currentBook?.pageIndex;
  let l = k!+1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentBook) return;
      if (e.key === "ArrowRight") currentBook.nextPage();
      else if (e.key === "ArrowLeft") currentBook.prevPage();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentBook]); // re-run if currentBook changes

  return (
    <div className="reader" ref={readerRef}>
      <div className="readerOptionsBtn" onClick={()=>{
        setOpen(!open);
      }}>☰</div>
      <div className={`readerOptions ${open? "isOpen": "notOpen"}`}>
       <div id="ro">

          <div id="ro0">Current Page : {l}</div>
          <div id="ro1">Name : {currentBook?.name}</div>
          <div id="ro2">
          <div id="ro2-0" onClick={()=>{
            currentBook?.prevPage()
          }}>Prev Page</div>
          <div id="ro2-1" onClick={()=>{
            currentBook?.nextPage()
          }}>Next Page</div>
          </div>
       </div>
        
      </div>
      <img src={currentBook?.currentPage} alt={currentBook?.name} />
    </div>
  );
};

export default Reader;

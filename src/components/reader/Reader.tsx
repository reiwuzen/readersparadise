import "./Reader.scss";
import { useRef, useEffect, useState } from "react";
import { useReader } from "@/hooks/useReader";
import { useTabs } from "@/hooks/useTabs";
// import { toast } from 'sonner';

const Reader = () => {
  const [open, setOpen] = useState<boolean>(false);
  const readerRef = useRef<HTMLDivElement>(null);
  const {activeTabId} =useTabs();
  const { readers } = useReader();
  let k = readers[activeTabId]?.pageIndex
  let l = k!+1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!readers[activeTabId]) return;
      if (e.key === "ArrowRight") readers[activeTabId]?.nextPage();
      else if (e.key === "ArrowLeft") readers[activeTabId]?.prevPage();
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [readers[activeTabId]]); // re-run if currentBook changes

  return (
    <div className="reader" ref={readerRef}>
      <div className="readerOptionsBtn" onClick={()=>{
        setOpen(!open);
      }}>☰</div>
      <div className={`readerOptions ${open? "isOpen": "notOpen"}`}>
       <div id="ro">

          <div id="ro0">Current Page : {l}</div>
          <div id="ro1">Name : {readers[activeTabId]?.name}</div>
          <div id="ro2">
          <div id="ro2-0" onClick={()=>{
            readers[activeTabId]?.prevPage()
          }}>Prev Page</div>
          <div id="ro2-1" onClick={()=>{
            readers[activeTabId]?.nextPage()
          }}>Next Page</div>
          </div>
       </div>
        
      </div>
      <img src={readers[activeTabId]?.currentPage} alt={readers[activeTabId]?.name} />
    </div>
  );
};

export default Reader;

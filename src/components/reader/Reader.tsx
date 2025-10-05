import './Reader.scss'
import { useRef, useEffect } from 'react';
import { useReader } from '@/hooks/useReader';
// import { toast } from 'sonner';

const Reader = () => {
  const readerRef = useRef<HTMLDivElement>(null);
  const { currentBook } = useReader();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!currentBook) return;
        if (e.key === 'ArrowRight') currentBook.nextPage();
        else if (e.key === 'ArrowLeft') currentBook.prevPage();
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentBook]); // re-run if currentBook changes

  return (
    <div className="reader" ref={readerRef}>
      <div className="readerOptions">☰</div>
      <img src={currentBook?.currentPage} alt={currentBook?.name} />
    </div>
  );
};

export default Reader;

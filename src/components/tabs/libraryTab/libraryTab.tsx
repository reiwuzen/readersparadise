import "./libraryTab.scss";
import Card from "@/components/cards/Cards";
import { useImport } from "@/hooks/useImport";
type LibraryTabProps = {};
const LibraryTab = () => {
  const { mangas, clearMangas } = useImport();
  return (
    <div className="libraryTab">
      <div className="recentReads">
        Placheholder
      </div>
      <div className="clearImports" onClick={clearMangas}>ClearImports</div>
      <div className="all">
        <h3>ALL</h3>
        <div className="insideAll">
        {mangas && mangas.map((book, i) => (
          <Card key={i} cardName={book.name} cover={book.cover!} />
        ))}
        </div>
      </div>
    </div>
  );
};
export default LibraryTab;
export type { LibraryTabProps };

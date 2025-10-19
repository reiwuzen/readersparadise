import CardV2 from "@/components/cardV2/cardV2";
import "./bookSearch.scss";
import { useDiscover } from "@/hooks/useDiscover";

export type BookSearchProps = {
  sVal: string;
};
const BookSearch = ({ sVal }: BookSearchProps) => {
  const { isLoading, error, searchResults } = useDiscover();
  return (
    <div className="bookSearch">
      {isLoading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!isLoading && searchResults.length > 0 && (
        <div className="discover-grid">
          {searchResults.map((manga, i) => (
            <CardV2 key={i} i={i} manga={manga}  />
          ))}
        </div>
      )}

      {!isLoading && !error && !searchResults.length && sVal && (
        <p className="status-msg">No results found.</p>
      )}
    </div>
  );
};
export default BookSearch;

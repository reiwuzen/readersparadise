import "./discoverTab.scss";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
import { useEffect, useState } from "react";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import CardV2 from "@/components/cardV2/cardV2";

const DiscoverTab = () => {
  const {
    searchResults,
    isLoading,
    error,
    searchManga,
    fetchChapterImages,
    clearResults,
  } = useDiscoverStore();

  const [sVal, setSVal] = useState<string>("");

  // 🔍 Debounced search
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (sVal.trim()) {
        await searchManga(sVal);
        console.log(useDiscoverStore.getState().searchResults);
      } else {
        clearResults();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [sVal]);

  return (
    <div className="discoverTab">
      {/* === Top Bar === */}
      <div className="accessoryBar">
        <div className="just-a-wrapper">
          <input
            type="search"
            id="searchBar"
            placeholder="Search here..."
            onInput={(e) => setSVal(e.currentTarget.value.trimStart())}
            value={sVal}
          />
          {sVal && (
            <button className="clear-btn" onClick={() => setSVal("")}>
              clear
            </button>
          )}
        </div>
        <AccessoryMenu />
      </div>

      {/* === Main Content === */}
      <div className="mainDiscoverTab">
        {isLoading && <p className="status-msg">Loading...</p>}
        {error && <p className="status-msg error">{error}</p>}

        {!isLoading && searchResults.length > 0 && (
          <div className="discover-grid">
            {searchResults.map((manga, i) => (
              <CardV2 key={i} i={i} manga={manga} />
            ))}
          </div>
        )}

        {!isLoading && !error && !searchResults.length && sVal && (
          <p className="status-msg">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default DiscoverTab;

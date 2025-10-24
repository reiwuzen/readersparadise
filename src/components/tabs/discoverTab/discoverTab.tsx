import "./discoverTab.scss";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
import { useEffect, useState } from "react";
// import { useActiveTab } from "@/hooks/useActiveTab";
// import { useTabs } from "@/hooks/useTabs";
import CardV2 from "@/components/cardV2/cardV2";
import { useDiscover } from "@/hooks/useDiscover";

const DiscoverTab = () => {
  const { isLoading, error, searchResults, searchBook, clearResults } = useDiscover();
  // const { changeTab } = useTabs();
  // const { activeMetaData, activeTabId } = useActiveTab();

  // Local search state tied to tab metadata
  const [localSVal, setLocalSVal] = useState<string>( "");

  useEffect(() => {
    const trim = localSVal.trim();
    const timeout = setTimeout(() => {
      const runSearch = async () => {
        if (trim.length > 0) {
          const url = `?search=${encodeURIComponent(trim)}`;
          const results = await searchBook(trim);
          // changeTab(activeTabId, `Search: ${trim}`, "discover", url, trim, {
          //   searchResults: results,
          // });
        } else {
          clearResults();
          // changeTab(activeTabId, "Discover", "discover", "", "", {});
        }
      };
      runSearch();
    }, 300);

    return () => clearTimeout(timeout);
  }, [localSVal]);

  return (
    <div className="discoverTab">
      {/* === Top Bar === */}
      <div className="accessoryBar">
        <div className="just-a-wrapper">
          <input
            type="search"
            id="searchBar"
            placeholder="Search here..."
            value={localSVal}
            onInput={(e) => setLocalSVal(e.currentTarget.value.trimStart())}
          />
          {localSVal && (
            <button className="clear-btn" onClick={() => setLocalSVal(``)}>
              clear
            </button>
          )}
        </div>
        <AccessoryMenu />
      </div>

      {/* === Main Content === */}
      <div className="mainDiscoverTab">
        <div className="bookSearch">
          {isLoading && <p className="status-msg">Loading...</p>}
          {error && <p className="status-msg error">{error}</p>}

          {!isLoading && searchResults.length > 0 && (
            <div className="discover-grid">
              {searchResults.map((manga, i) => (
                <CardV2 key={i} i={i} Book={manga} />
              ))}
            </div>
          )}

          {!isLoading && !error && !searchResults.length && localSVal && (
            <p className="status-msg">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverTab;

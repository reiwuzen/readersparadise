import "./discoverTab.scss";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
import { useEffect, useState } from "react";
import { useActiveTab } from "@/hooks/useActiveTab"; 
// import { useTabs } from "@/hooks/useTabs";
import CardV2 from "@/components/cardV2/cardV2";
import { useDiscover } from "@/hooks/useDiscover";
import { TabState } from "@/types/tabTypes";
import { createTabState } from "@/store/useTabsStore";
import { SearchResult } from "@/store/useDiscoverStore";

const DiscoverTab = () => {
  const { searchBook, clearResults } = useDiscover();
  function isDiscoverTab(tab?: TabState): tab is TabState<"discover"> {
    return tab?.type === "discover";
  }
  // const { changeTab } = useTabs();
  const { activeTabData, changeActiveTabPage, updateActiveTabData } =
    useActiveTab();
  const z = isDiscoverTab(activeTabData) ? activeTabData.data.query : "";
  console.log(z);
  // Local search state tied to tab metadata
  const [localSVal, setLocalSVal] = useState<string>(z);
  const searchResults = isDiscoverTab(activeTabData)
    ? activeTabData.data.searchResults
    : [];
  const isLoading = isDiscoverTab(activeTabData)
    ? activeTabData.data.isLoading
    : true;
  useEffect(() => {
    const trim = localSVal.trim();
    const timeout = setTimeout(() => {
      const runSearch = async () => {
        if (trim.length > 0) {
          // Set loading before awaiting
          changeActiveTabPage(
            createTabState(
              "discover",
              `Search: ${trim}`,
              `/discover/?search=${encodeURIComponent(trim)}`,
              {
                query: trim,
                searchResults: [],
                isLoading: true,
              }
            )
          );

          const results = await searchBook(trim);

          updateActiveTabData(
            "replace",
            createTabState(
              "discover",
              `Search: ${trim}`,
              `/discover/?search=${encodeURIComponent(trim)}`,
              {
                query: trim,
                searchResults: results,
                isLoading: false,
              }
            )
          );
        }
        else if (trim.length === 0) {
          updateActiveTabData(
            "replace",
            createTabState(
              "discover",
              `Discover`,
              `/discover/
             
              `,
              {
                query: trim,
                searchResults: [],
                isLoading: false,
              }
            )
          );
        }
        //  else {
        //   clearResults();
        //   changeActiveTabPage(createTabState('discover', `Discover`, `/discover/`, {
        //     query: `from else?`,
        //     searchResults: [],
        //     isLoading: false,
        //   }));
        // }
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
          {/* {error && <p className="status-msg error">{error}</p>} */}

          {!isLoading && searchResults.length > 0 && (
            <div className="discover-grid">
              {searchResults.map((manga, i) => (
                <CardV2 key={i} i={i} Book={manga} />
              ))}
            </div>
          )}

          {!isLoading &&
            //  && !error
            !searchResults.length &&
            localSVal && <p className="status-msg">No results found.</p>}
        </div>
      </div>
    </div>
  );
};

export default DiscoverTab;

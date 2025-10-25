import "./discoverTab.scss";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
import { useEffect, useState } from "react";
import { useActiveTab } from "@/hooks/useActiveTab";
import CardV2 from "@/components/cardV2/cardV2";
import { useDiscover } from "@/hooks/useDiscover";
import { TabState } from "@/types/tabTypes";
import { createTabState } from "@/store/useTabsStore";

const DiscoverTab = () => {
  const { searchBook } = useDiscover();
  const { activeTabData, changeActiveTabPage, updateActiveTabData } = useActiveTab();

  function isDiscoverTab(tab?: TabState): tab is TabState<"discover"> {
    return tab?.type === "discover";
  }

  const tabData = isDiscoverTab(activeTabData)
    ? activeTabData.data
    : { query: "", searchResults: [], isLoading: false };

  const [localQuery, setLocalQuery] = useState(tabData.query);

  // === On mount: if query is non-empty and has no results, search ===
  useEffect(() => {
    if (!isDiscoverTab(activeTabData)) return;
    const initialQuery = activeTabData.data.query.trim();

    if (
      initialQuery.length > 0 &&
      tabData.searchResults.length === 0 &&
      activeTabData.data.searchResults.length === 0
    ) {
      (async () => {
        updateActiveTabData(
          "replace",
          createTabState(
            "discover",
            `Search: ${initialQuery}`,
            `/discover/?search=${encodeURIComponent(initialQuery)}`,
            {
              query: initialQuery,
              searchResults: [],
              isLoading: true,
            }
          )
        );

        const results = await searchBook(initialQuery);

        updateActiveTabData(
          "replace",
          createTabState(
            "discover",
            `Search: ${initialQuery}`,
            `/discover/?search=${encodeURIComponent(initialQuery)}`,
            {
              query: initialQuery,
              searchResults: results,
              isLoading: false,
            }
          )
        );
      })();
    }
  }, []);

  // === When typing, trigger new tab + fetch (if no existing results) ===
  useEffect(() => {
    if (!isDiscoverTab(activeTabData)) return;
    const trimmed = localQuery.trim();
    const oldQuery = activeTabData.data.query;
    const hasExistingResults = activeTabData.data.searchResults.length > 0;

    // prevent unnecessary search
    if (trimmed === oldQuery || hasExistingResults) return;

    const timeout = setTimeout(async () => {
      if (trimmed.length === 0) return;

      changeActiveTabPage(
        createTabState(
          "discover",
          `Search: ${trimmed}`,
          `/discover/?search=${encodeURIComponent(trimmed)}`,
          {
            query: trimmed,
            searchResults: [],
            isLoading: true,
          }
        )
      );

      const results = await searchBook(trimmed);

      updateActiveTabData(
        "replace",
        createTabState(
          "discover",
          `Search: ${trimmed}`,
          `/discover/?search=${encodeURIComponent(trimmed)}`,
          {
            query: trimmed,
            searchResults: results,
            isLoading: false,
          }
        )
      );
    }, 400);

    return () => clearTimeout(timeout);
  }, [localQuery]);

  // === Clear button ===
  const handleClear = () => {
    setLocalQuery("");
    updateActiveTabData(
      "replace",
      createTabState("discover", `Discover`, `/discover/`, {
        query: "",
        searchResults: [],
        isLoading: false,
      })
    );
  };

  const isLoading = tabData.isLoading;
  const searchResults = tabData.searchResults;

  return (
    <div className="discoverTab">
      {/* === Top Bar === */}
      <div className="accessoryBar">
        <div className="just-a-wrapper">
          <input
            type="search"
            id="searchBar"
            placeholder="Search here..."
            value={localQuery}
            onInput={(e) => setLocalQuery(e.currentTarget.value.trimStart())}
          />
          {localQuery && (
            <button className="clear-btn" onClick={handleClear}>
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

          {!isLoading && searchResults.length > 0 && (
            <div className="discover-grid">
              {searchResults.map((manga, i) => (
                <CardV2 key={i} i={i} Book={manga} />
              ))}
            </div>
          )}

          {!isLoading && !searchResults.length && localQuery && (
            <p className="status-msg">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverTab;

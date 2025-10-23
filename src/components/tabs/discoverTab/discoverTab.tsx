import "./discoverTab.scss";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
import { useEffect, useState } from "react";
import { useActiveTab } from "@/hooks/useActiveTab";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import CardV2 from "@/components/cardV2/cardV2";
import { useDiscover } from "@/hooks/useDiscover";

const DiscoverTab = () => {
  const { searchBook, clearResults, selectedBook, bookChapter } =
    useDiscoverStore();
    const { isLoading, error, searchResults } = useDiscover();
  const { activeMetaData, setNewMetaData } = useActiveTab();

  // Local state while typing
  const [localSVal, setLocalSVal] = useState<string>(
    activeMetaData?.optional?.sVal ?? ""
  );

  // Debounced effect: update metadata and perform search after user stops typing
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!activeMetaData) return;
      const x = (): string => {
        if (localSVal.length !== 0) {
          return `/discover?search=${localSVal}`;
        } else {
          return `/discover`;
        }
      };
      setNewMetaData(activeMetaData.name ?? "Discover", x(), {
        sVal: localSVal,
      });

      if (localSVal.trim()) {
        await searchBook(localSVal);
      } else {
        clearResults();
      }
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
            <button className="clear-btn" onClick={() => setLocalSVal("")}>
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
            <CardV2 key={i} i={i} Book={manga}  />
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

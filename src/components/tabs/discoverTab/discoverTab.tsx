import "./discoverTab.scss";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
import { useEffect, useState } from "react";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import BookSearch from "@/components/books/bookSearch/bookSearch";
import BookInfo from "@/components/books/bookInfo/bookInfo";

const DiscoverTab = () => {
  const { searchManga, fetchChapterImages, clearResults } = useDiscoverStore();

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
        <BookSearch sVal={sVal} />
      </div>
    </div>
  );
};

export default DiscoverTab;

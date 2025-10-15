import "./discoverTab.scss";
import useSourceStore from "../../../store/useSourceStore";
import { useEffect, useState } from "react";
type BrowserTabProps = {
  innerTabId?: string;
  qActive?: boolean;
  qListed?: boolean;
};

const DiscoverTab = ({ innerTabId, qActive, qListed }: BrowserTabProps) => {
  const { selected } = useSourceStore();
  const inner = innerTabId;
  const [sVal, setSVal] = useState<string>("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sVal) {
        console.log("Searching for:", sVal);
        // performSearch(sVal)
      }
    }, 300); // wait 300ms after typing stops

    return () => clearTimeout(timeout);
  }, [sVal]);
  return (
    <div className="discoverTab">
      <div className="accessoryBar">
        <div className="just-a-wrapper">
          <input
            type="search"
            name=""
            id="searchBar"
            placeholder="Search here..."
            onInput={(e) => {
              setSVal(e.currentTarget.value.trimStart());
            }}
            value={sVal}
          />
          {sVal && (
            <button className="clear-btn" onClick={() => setSVal("")}>
              clear
            </button>
          )}
        </div>
        <div className="accessoryMenu">
          <button
            id="menuBtn"
            
            onClick={()=>{
              
            }}
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">
  <rect x="3" y="5.5" width="18" height="2" rx="1"></rect>
  <rect x="3" y="10.5" width="18" height="2" rx="1"></rect>
  <rect x="3" y="15.5" width="18" height="2" rx="1"></rect>
</svg>
            Menu
          </button>
        </div>
      </div>
      <div className="mainDiscoverTab"></div>
    </div>
  );
};

export default DiscoverTab;

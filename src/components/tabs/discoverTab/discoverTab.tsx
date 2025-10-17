import "./discoverTab.scss";
import useSourceStore from "../../../store/useSourceStore";
import AccessoryMenu from "@/components/accessoryMenu/accessoryMenu";
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
        <AccessoryMenu />
      </div>
      <div className="mainDiscoverTab"></div>
    </div>
  );
};

export default DiscoverTab;

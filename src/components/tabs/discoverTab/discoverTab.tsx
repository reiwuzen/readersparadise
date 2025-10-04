// import { useEffect } from "react";
// import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./discoverTab.scss";
import EmbdBrowser from "./embdBrowser/embdBrowser";
import useSourceStore from "../../../store/useSourceStore";
type BrowserTabProps = {
  innerTabId: string;
  qActive: boolean;
  qListed: boolean;
};

const DiscoverTab = ({ innerTabId, qActive, qListed }: BrowserTabProps) => {
  console.log("Render DiscoverTab", { innerTabId, qActive, qListed });
  const { selected } = useSourceStore();
  console.log(selected);

  return (
    <div className="browserTab">
      <div className="browserTabSideBar">
        <ul>
          {[...selected]
            .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
            .map((src) => (
              <li key={src}>{src}</li>
            ))}
        </ul>
      </div>
      <div className="browserTabMain">
        <EmbdBrowser id={innerTabId} isActive={qActive} isListed={qListed} />
      </div>
    </div>
  );
};

export default DiscoverTab;

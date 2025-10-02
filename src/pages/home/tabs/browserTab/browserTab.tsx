// import { useEffect } from "react";
// import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./browserTab.scss";
import EmbdBrowser from "./embdBrowser/embdBrowser";
import useSourceStore from "../../../../hooks/store";
type BrowserTabProps = {
  innerTabId: string;
  qActive: boolean;
  qListed: boolean;
};

const BrowserTab = ({ innerTabId, qActive, qListed }: BrowserTabProps) => {
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

export default BrowserTab;

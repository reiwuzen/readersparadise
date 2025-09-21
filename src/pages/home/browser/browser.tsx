import { Webview } from "@tauri-apps/api/webview";
import { Window } from "@tauri-apps/api/window";
type BrowserTabProps = {};

const BrowserTab = ({}: BrowserTabProps) => {
  const appWindow = new Window("uniqueLabel");
  appWindow.once("tauri://created", async function () {
    const webview = new Webview(appWindow, "theUniqueLabel", {
      url: "hentairead.com/genre/manga/",

      // create a webview with specific logical position and size
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    });
  });
  return (
    <div className="browserTab">
      <div className="browserTabSideBar"></div>
      <div className="browserTabMain"></div>
    </div>
  );
};
export default BrowserTab;

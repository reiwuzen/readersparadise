import "./embdBrowser.scss";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
// import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
type EmbdBrowserProps = { 
  id: string;
   isActive: boolean;
    isListed: boolean;
    url?: string;
   };
const EmbdBrowser = ({ id, isActive, isListed, url }: EmbdBrowserProps) => {
  const mainWindow = getCurrentWindow();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webviewRef = useRef<WebviewWindow | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    requestAnimationFrame(() => {
      const rect = containerRef.current!.getBoundingClientRect();
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;
      console.log(`the width & height of container is ${width} & ${height}`);
      const x = Math.round(rect.x);
      const y = Math.round(rect.y);
      const webview = new WebviewWindow(`${id}`, {
        url: url ??"https://github.com/reiwuzen/readersparadise",
        x: x - 1,
        y: y + 22,
        width: width - 10,
        height: height - 8,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        contentProtected: true,
        focus: false,
        decorations: false,
        transparent: true,
        parent: mainWindow,
      });
      webviewRef.current = webview;
      webview.once("tauri://window-created", () => {
        console.log("Webview created!");
      });
      webview.once("tauri://error", (e) => {
        console.error("Webview creation error", e);
      });
    });
    return () => {
      webviewRef.current?.close().catch(console.error);
    };
  }, [id]);
  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;
    if (!isListed) {
      console.log("webview is already closed");
      webview.close().catch(console.error);
    } else if (isListed) {
      if (isActive) webview.show();
      else if (!isActive) webview.hide();
    }
  }, [isActive, isListed]);
  
  useEffect(() => {
    if (!webviewRef.current || !containerRef.current) return;

    const updateBounds = () => {
      if (!containerRef.current || !webviewRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      webviewRef.current.setSize(new PhysicalSize(
        Math.round(rect.width),
        Math.round(rect.height)
      ));

      webviewRef.current.setPosition(new PhysicalPosition(
        Math.round(rect.x),
        Math.round(rect.y)
      ));
    };

    const unlistenResize = mainWindow.onResized(updateBounds);
    const unlistenMoved = mainWindow.onMoved(updateBounds);

    return () => {
      unlistenResize.then(f => f());
      unlistenMoved.then(f => f());
    };
  }, []);
  return (
    <div className="embdBrowser" ref={containerRef}>
      hello
    </div>
  );
};
export default EmbdBrowser;

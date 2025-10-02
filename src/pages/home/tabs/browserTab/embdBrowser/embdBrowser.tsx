import "./embdBrowser.scss";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
// import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";
import { PhysicalPosition } from "@tauri-apps/api/dpi";
type EmbdBrowserProps = {
  id: string;
  isActive: boolean;
  isListed: boolean;
};
const EmbdBrowser = ({ id, isActive, isListed }: EmbdBrowserProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webviewRef = useRef<WebviewWindow | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    requestAnimationFrame(()=>{

        const rect = containerRef.current!.getBoundingClientRect();
        const width = containerRef.current!.clientWidth;
        const height = containerRef.current!.clientHeight;
        console.log(`the width & height of container is ${width} & ${height}`);
        const x = Math.round(rect.x);
        const y = Math.round(rect.y);
        // let ad = "uwdsdasda";
        
        const webview = new WebviewWindow(`${id}`, {
            url: "https://github.com/tauri-apps/tauri",
            x: x,
            y: y,
            width,
            height,
            contentProtected: true,
            focus: false,
            decorations: false,
            transparent: true,
        });
        webviewRef.current = webview;
        
        webview.once("tauri://window-created", () => {
            console.log("Webview created!");
        });
        
        webview.once("tauri://error", (e) => {
            console.error("Webview creation error", e);
        });
    })
    
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

  return <div className="embdBrowser" ref={containerRef}>
    hello
  </div>;
};

export default EmbdBrowser;

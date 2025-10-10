import "./embdBrowser.scss";
import { WebviewWindow, getAllWebviewWindows } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { useEffect, useRef } from "react";
import { useTabs } from "@/hooks/useTabs";

type EmbdBrowserProps = {
  id: string;
  url?: string;
};

const EmbdBrowser = ({ id, url }: EmbdBrowserProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webviewRef = useRef<WebviewWindow | null>(null);
  const mainWindow = getCurrentWindow();
  const { tabs, activeTabId } = useTabs();

  const webviewId = useRef(`embd-${id}`); // stable id per tab
  const hasCreated = useRef(false);
  const destroyOnNext = useRef(false);

  /** 🧩 Create webview only when tab is truly registered */
  useEffect(() => {
    const tabExists = tabs.some((t) => t.id === id);
    if (!tabExists || hasCreated.current || !containerRef.current) return;
    hasCreated.current = true;

    let isUnmounted = false;

    (async () => {
      // Prevent duplicate handles
      const existing = await getAllWebviewWindows();
      if (existing.find((w) => w.label === webviewId.current)) return;

      const rect = containerRef.current!.getBoundingClientRect();
      const mainPos = await mainWindow.innerPosition();
      const scale = window.devicePixelRatio || 1;

      const x = Math.round(rect.left * scale + mainPos.x);
      const y = Math.round(rect.top * scale + mainPos.y);
      const width = Math.round(rect.width * scale);
      const height = Math.round(rect.height * scale);

      const webview = new WebviewWindow(webviewId.current, {
        url: url ?? "https://google.com",
        x,
        y,
        width,
        height,
        parent: mainWindow,
        decorations: false,
        transparent: true,
        skipTaskbar: true,
        resizable: false,
        focus: false,
      });

      webviewRef.current = webview;

      webview.once("tauri://window-created", async () => {
        if (isUnmounted || destroyOnNext.current) {
          console.log("🧹 Immediately closing orphaned webview", webviewId.current);
          await webview.close().catch(() => {});
          return;
        }
        console.log(`✅ Webview ${webviewId.current} created`);
      });

      webview.once("tauri://error", (e) => {
        console.error("❌ Webview creation error", e);
      });
    })();

    return () => {
      isUnmounted = true;
      const current = webviewRef.current;
      if (current) current.close().catch(() => {});
      else destroyOnNext.current = true;
    };
  }, [tabs, id, url]);

  /** 🧩 Visibility sync */
  useEffect(() => {
    const syncVisibility = async () => {
      const webview = webviewRef.current;
      if (!webview) return;

      const isListed = tabs.some((t) => t.id === id);
      const isActive = activeTabId === id;

      if (!isListed) {
        console.log("🧩 Closing", id);
        try {
          await webview.close();
          webviewRef.current = null;
        } catch (e) {
          console.warn("⚠️ Webview close failed:", e);
        }
      } else {
        try {
          if (isActive) await webview.show();
          else await webview.hide();
        } catch {}
      }
    };

    syncVisibility();
  }, [tabs, activeTabId, id]);

  /** 🧩 Window movement sync */
  useEffect(() => {
    const updateBounds = async () => {
      if (!containerRef.current || !webviewRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mainPos = await mainWindow.innerPosition();
      const scale = window.devicePixelRatio || 1;

      const x = Math.round(rect.left * scale + mainPos.x);
      const y = Math.round(rect.top * scale + mainPos.y);
      const w = Math.round(rect.width * scale);
      const h = Math.round(rect.height * scale);

      try {
        await webviewRef.current.setSize(new PhysicalSize(w, h));
        await webviewRef.current.setPosition(new PhysicalPosition(x, y));
      } catch {}
    };

    const unlistenResize = mainWindow.onResized(updateBounds);
    const unlistenMoved = mainWindow.onMoved(updateBounds);

    return () => {
      unlistenResize.then((f) => f());
      unlistenMoved.then((f) => f());
    };
  }, []);

  return <div className="embdBrowser" ref={containerRef}></div>;
};

export default EmbdBrowser;

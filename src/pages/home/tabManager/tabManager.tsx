import "./tabManager.scss";
import { useState } from "react";
import LibraryTab from "../tabs/libraryTab/libraryTab";
import SettingsTab from "../tabs/settingsTab/settingsTab";
import BrowserTab from "../tabs/browserTab/browserTab";
import Tab from "./l1/tab";
import { ImageFile } from "../../../../helper/fs";
export type TabType = "library" | "browser" | "settings";
type TabItem = {
  id: string;
  name: string;
  type: TabType;
  listed?: boolean;
};
type TabManagerProps = {
  images: ImageFile[];
};
const TabManager = ({ images }: TabManagerProps) => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: "1", name: "Library", type: "library", listed: true },
  ]);

  const [activeTabId, setActiveTabId] = useState("1");

  const addTab = (type: TabType) => {
    const newId = crypto.randomUUID();
    const newTab: TabItem = {
      id: newId,
      name: type[0].toUpperCase() + type.slice(1),
      type,
      listed: true,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };
  const closeTab = (id: string) => {
    // prevent closing the last tab
    if (tabs.length === 1) return;
    setTabs((prev) => {
      // Mark the tab as listed = false
      const updated = prev.map((t) =>
        t.id === id ? { ...t, listed: false } : t
      );

      // Remove the closed tab
      const filtered = updated.filter((t) => t.id !== id);

      // Update active tab if necessary
      if (activeTabId === id && filtered.length > 0) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }

      return filtered;
    });
  };
  // 🔥 render correct content for each tab
  const renderContent = (tab: TabItem) => {
    switch (tab.type) {
      // case "home":
      //   return <HomeTab images={images} />;
      case "library":
        return <LibraryTab />;
      case "browser":
        return (
          <BrowserTab
            innerTabId={tab.id}
            qActive={tab.id === activeTabId}
            qListed={tab.listed ?? false}
          />
        );
      case "settings":
        return <SettingsTab />;
      default:
        return <div>Unknown tab</div>;
    }
  };
  // /* 🔥 expose openTab for Navbar (imperative way) */
  // /* You can later refactor this with forwardRef if needed */
  const activeTab = tabs.find((t) => t.id === activeTabId);
  (window as any).openTab = addTab;
  const onActiveTab = (tabType: TabType, tabName: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              type: tabType,
              name: tabName,
            }
          : t
      )
    );
  };
  (window as any).onActiveTab = onActiveTab;

  return (
    <div className="tabManager">
      <div className="tabBar">
        <button className="prevBtn">{`<`}</button>
        <button className="nextBtn">{`>`}</button>
        <button className="addTabBtn" onClick={() => addTab("library")}>
          +
        </button>
        <div className="tabs">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              name={tab.name}
              isActive={tab.id === activeTabId}
              onClick={() => setActiveTabId(tab.id)}
              onClose={() => closeTab(tab.id)}
              // type={tab.type}
              // listed={tab.listed!}
            />
          ))}
        </div>
      </div>
      <div className="tabContent">{activeTab && renderContent(activeTab)}</div>
    </div>
  );
};

export default TabManager;

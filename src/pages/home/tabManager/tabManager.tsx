import { useEffect, useState } from "react";
import "../../../styles/home/tabManager/tabManager.scss";
import HomeTab from "../homeTab/homeTab";
import SettingsTab from "../settings/settings";
import BrowserTab from "../browser/browser";
import Tab from "./l1/tab";
import { ImageFile } from "../../../../helper/fs";
export type TabType = "home" | "library" | "browser" | "settings";
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
    { id: '1', name: "Home", type: "home", listed: true },
  ]);

  const [activeTab, setActiveTab] = useState('1');

  const addTab = (type: TabType) => {
    const newId = crypto.randomUUID();
    const newTab: TabItem = {
      id: newId,
      name: type[0].toUpperCase() + type.slice(1),
      type,
      listed: true,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
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
      if (activeTab === id && filtered.length > 0) {
        setActiveTab(filtered[filtered.length - 1].id);
      }

      return filtered;
    });
  };
  // 🔥 render correct content for each tab
  const renderContent = (tab: TabItem) => {
    switch (tab.type) {
      case "home":
        return <HomeTab images={images} />;
      case "library":
        return <div>📚 Library</div>;
      case "browser":
        return (
          <BrowserTab
            innerTabId={tab.id}
            qActive={tab.id === activeTab}
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
  (window as any).openTab = addTab;
  const active = tabs.find((t) => t.id === activeTab);

  return (
    <div className="tabManager">
      <div className="tabBar">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            name={tab.name}
            isActive={tab.id === activeTab}
            onClick={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
            // type={tab.type}
            // listed={tab.listed!}
          />
        ))}
        <button className="addTabBtn" onClick={() => addTab("home")}>
          +
        </button>
      </div>
      <div className="tabContent">{active && renderContent(active)}</div>
    </div>
  );
};

export default TabManager;

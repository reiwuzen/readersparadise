import { useState } from "react";
import '../../../styles/home/tabManager/tabManager.scss'
import HomeTab from "../homeTab/homeTab";
import SettingsTab from "../settings/settings";
import BrowserTab from "../browser/browser";
import Tab from "./l1/tab";
import { ImageFile } from "../../../../helper/fs";
export type TabType = "home" | "library" | "browser" | "settings";
type TabItem = {
  id: number;
  name: string;
  type: TabType;
};
type TabManagerProps = {
  images: ImageFile[],
}
const TabManager = ({images}:TabManagerProps) => {
  const [tabs, setTabs] = useState<TabItem[]>([
    { id: 1, name: "Home", type: "home" },
  ]);
  const [activeTab, setActiveTab] = useState(1);

  const addTab = (type: TabType) => {
    const newId = Date.now();
    const newTab: TabItem = {
      id: newId,
      name: type[0].toUpperCase() + type.slice(1),
      type,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const closeTab = (id: number) => {
    // prevent closing the last tab
    if (tabs.length === 1) return;

    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);

    // if the active tab is closed, switch to last remaining tab
    if (activeTab === id) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };
  // 🔥 render correct content for each tab
  const renderContent = (tab: TabItem) => {
    switch (tab.type) {
      case "home":
        return <HomeTab images={images} />;
      case "library":
        return <div>📚 Library</div>;
      case "browser":
        return <BrowserTab />;
      case "settings":
        return <SettingsTab />;
        default:
          return <div>Unknown tab</div>;
        }
      };
      {/* 🔥 expose openTab for Navbar (imperative way) */}
      {/* You can later refactor this with forwardRef if needed */}
      {(window as any).openTab = addTab}
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
          />
        ))}
        <button className="addTabBtn" onClick={() => addTab("home")}>
          +
        </button>
      </div>
      <div className="tabContent">
        {active && renderContent(active)}
      </div>
    </div>
  );
};

export default TabManager;

import "./tabManager.scss";
import { useTabs } from "../../../hooks/useTabs";
import LibraryTab from "../tabs/libraryTab/libraryTab";
import SettingsTab from "../tabs/settingsTab/settingsTab";
import BrowserTab from "../tabs/browserTab/browserTab";
import Tab from "./components/tab/tab";
import { ImageFile } from "../../../../helper/fs";

import { TabItem } from "../../../store/useTabsStore";
type TabManagerProps = {
  images: ImageFile[];
};
const TabManager = ({ images }: TabManagerProps) => {
  const { tabs, activeTab, activeTabId, setActiveTabId, addTab, closeTab } = useTabs();

  const renderContent = (tab: TabItem) => {
    switch (tab.type) {
      case "library": return <LibraryTab />;
      case "discover": return <BrowserTab innerTabId={tab.id} qActive={tab.id === activeTabId} qListed={tab.listed ?? false} />;
      case "settings": return <SettingsTab />;
      default: return <div>Unknown tab</div>;
    }
  };

  return (
    <div className="tabManager">
      <div className="tabBar">
        <button className="prevBtn">{`<`}</button>
        <button className="nextBtn">{`>`}</button>
        <button className="addTabBtn" onClick={() => addTab("library")}>+</button>
        <div className="tabs">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              name={tab.name}
              isActive={tab.id === activeTabId}
              onClick={() => setActiveTabId(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          ))}
        </div>
      </div>
      <div className="tabContent">{activeTab && renderContent(activeTab)}</div>
    </div>
  );
};

export default TabManager;

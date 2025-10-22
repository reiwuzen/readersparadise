import "./tabManager.scss";
import { useTabs } from "@/hooks/useTabs";
import { useActiveTab } from "@/hooks/useActiveTab";
import { useSearchTabs } from "@/hooks/useSearchTabs";
import Tab from "./components/tab/tab";
import InnerSearchTabs from "@/components/InnerSearchTabs/InnerSearchTabs";
import { ImageFile } from "../../../helper/fs";
import { toast } from "sonner";

type TabManagerProps = {
  images: ImageFile[];
};

const TabManager = ({ images }: TabManagerProps) => {
  const {
    tabs,
    recentTabs,
    openRecentTabs,
    closeRecentTabs,
    switchTab,
    addTab,
    closeTab,
  } = useTabs();

  const { activeTab, activeMetaData, goBack, goForward } = useActiveTab();

  const { isOpen, inputRef, dropdownRef, divRef, open, close } =
    useSearchTabs();

  return (
    <div className="tabManager">
      <div className="tabBar">
        {/* Back / Forward buttons */}
        <button className="prevBtn" onClick={goBack}>{`<`}</button>
        <button className="nextBtn" onClick={goForward}>{`>`}</button>

        <div id="appUrl">
          Url:
          {activeMetaData ? (
            <input type="url" value={activeMetaData.url} readOnly />
          ) : null}
        </div>

        {/* Search Tabs */}
        <div
          className="searchTabsBtn"
          onClick={isOpen ? close : open}
          ref={divRef}
        >
          <div
            className={`searchTabs ${isOpen ? "open" : "close"}`}
            onClick={(e) => e.stopPropagation()}
            ref={dropdownRef}
          >
            <div className="searchTab">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="searchIcon"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5 1.5-1.5-5-5zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z" />
              </svg>
              <input type="search" placeholder="Search tabs" ref={inputRef} />
            </div>

            <div id="sep"></div>

            <div className="inSearchTabs">
              <ul className="openTabs">
                <h3>Open tabs</h3>
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <InnerSearchTabs
                      tab={{
                        name: tab.activeMetaData.name,
                        isActive: tab.id === activeTab?.id,
                        onClick: () => switchTab(tab.id),
                        onClose: () => closeTab(tab.id),
                      }}
                    />
                  </li>
                ))}
              </ul>

              <ul className="recentTabs">
                <h3>Recent tabs</h3>
                {recentTabs.map((tab) => (
                  <li key={tab.id}>
                    <InnerSearchTabs
                      tab={{
                        name: tab.activeMetaData.name,
                        isActive: false,
                        onClick: () => openRecentTabs(tab.id),
                        onClose: () => closeRecentTabs(tab.id),
                      }}
                      type="recent"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button className="addTabBtn" onClick={() => addTab("library")}>
          +
        </button>

        <div className="tabs">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              name={tab.activeMetaData.name}
              isActive={tab.id === activeTab?.id}
              onClick={() => switchTab(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          ))}
        </div>
      </div>

      <div className="tabContent">
        {activeTab && activeMetaData ? (
          (() => {
            const TabComponent = activeMetaData.tabContent;
            return <TabComponent />;
          })()
        ) : (
          <div>Welcome Screen</div>
        )}
      </div>
    </div>
  );
};

export default TabManager;

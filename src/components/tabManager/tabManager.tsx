import "./tabManager.scss";
// import { useTabs } from "@/hooks/useTabs";
// import { useActiveTab } from "@/hooks/useActiveTab";
import { useSearchTabs } from "@/hooks/useSearchTabs";
import Tab from "./components/tab/tab";
import InnerSearchTabs from "@/components/InnerSearchTabs/InnerSearchTabs";
import { useTabsStore } from "@/store/useTabsStore";
import { useActiveTab } from "@/hooks/useActiveTab";
// import { toast } from "sonner";

const TabManager = () => {
  // const {
  //   tabs,
  //   recentTabs,
  //   openRecentTabs,
  //   closeRecentTabs,
  //   switchTab,
  //   addTab,
  //   closeTab,
  // } = useTabs();

  // const { activeTab, activeMetaData, goBack, goForward } = useActiveTab();
  const {
    tabs,
    recentTabs,
    openRecentTab,
    closeRecentTab,
    switchTab,
    addTab,
    closeTab,
  } = useTabsStore();
  const { activeTab, activeTabData, goBackActiveTab, goForwardActiveTab } =
    useActiveTab();
  const { isOpen, inputRef, dropdownRef, divRef, open, close } =
    useSearchTabs();

  return (
    <div className="tabManager">
      <div className="tabBar">
        {/* Back / Forward buttons */}
        <button className="prevBtn" onClick={goBackActiveTab}>{`<`}</button>
        <button className="nextBtn" onClick={goForwardActiveTab}>{`>`}</button>

        <div id="appUrl">
          Url:
          {activeTabData ? (
            <input type="url" value={activeTabData.url} readOnly />
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
                {tabs && tabs.map((tab) => (
                  <li key={tab.id}>
                    <InnerSearchTabs
                      tab={{
                        name: tab.activeData.name,
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
                {recentTabs && recentTabs.map((tab) => (
                  <li key={tab.id}>
                    <InnerSearchTabs
                      tab={{
                        name: tab.activeData.name,
                        isActive: false,
                        onClick: () => openRecentTab(tab.id),
                        onClose: () => closeRecentTab(tab.id),
                      }}
                      type="recent"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="icon-sm text-token-text-tertiary"
            >
              <path d="M12.1338 5.94433C12.3919 5.77382 12.7434 5.80202 12.9707 6.02929C13.1979 6.25656 13.2261 6.60807 13.0556 6.8662L12.9707 6.9707L8.47067 11.4707C8.21097 11.7304 7.78896 11.7304 7.52926 11.4707L3.02926 6.9707L2.9443 6.8662C2.77379 6.60807 2.80199 6.25656 3.02926 6.02929C3.25653 5.80202 3.60804 5.77382 3.86617 5.94433L3.97067 6.02929L7.99996 10.0586L12.0293 6.02929L12.1338 5.94433Z"></path>
            </svg>
          }
        </div>

        <button className="addTabBtn" onClick={() => addTab("library", {})}>
          +
        </button>

        <div className="tabs">
          {tabs && tabs.map((tab) => (
            <Tab
              key={tab.id}
              name={tab.activeData.name}
              isActive={tab.id === activeTab?.id}
              onClick={() => switchTab(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          ))}
        </div>
      </div>

      <div className="tabContent">
        {activeTab && activeTabData ? (
          (() => {
            const TabComponent = activeTabData.content;
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

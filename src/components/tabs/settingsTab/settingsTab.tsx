import { useActiveTab } from "@/hooks/useActiveTab";
import "./settingsTab.scss";
import { useSettings } from "@/hooks/useSettings";
import { createTabState } from "@/store/useTabsStore";



const SettingsTab = () => {
  const {updateActiveTabData} = useActiveTab();
  const {items, setItemActive, activeItem} = useSettings();
  return (
    <div className="settingsTab">
      <div className="settingsTabSideBar">
        <ul>
          {items.map((item)=>(
            <li
              key={item.itemId}
              className={item.isItemActive ? "active" : ""}
              onClick={() => {
                updateActiveTabData('replace',createTabState('settings','Settings',`/settings/${item.title}`,{}))
                setItemActive(item.itemId)}}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="settingsTabMain">
        {activeItem?.content && <activeItem.content />}
      </div>
    </div>
  );
};

export default SettingsTab;

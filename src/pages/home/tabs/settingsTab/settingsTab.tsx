
import "./settingsTab.scss";
import { useSettings } from "@/hooks/useSettings";



const SettingsTab = () => {
  const {items,setItemActive , activeItem} = useSettings();

  return (
    <div className="settingsTab">
      {/* Sidebar */}
      <div className="settingsTabSideBar">
        <ul>
          {items.map((item)=>(
            <li
              key={item.itemId}
              className={item.isItemActive ? "active" : ""}
              onClick={() => setItemActive(item.itemId)}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="settingsTabMain">
        {activeItem?.content && <activeItem.content />}
      </div>
    </div>
  );
};

export default SettingsTab;

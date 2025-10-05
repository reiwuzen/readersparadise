import { CSSProperties, useState } from "react";
import "./style.scss";
import { useTabs } from "./useTabs";
type MenuItem = {
  label?: string;
  action?: () => void;
  separator?: boolean;
  // optional, for dividers
};
import { TabType } from "../store/useTabsStore";
type MenuState = {
  x: number;
  y: number;
  items: MenuItem[];
  style?: CSSProperties;
} | null;

export const useContextMenu = () => {
  const { addTab } = useTabs();
  const [menu, setMenu] = useState<MenuState>(null);
  // call this to open a menu
  const preDef = (tab?: TabType): MenuItem[] => {
    const items: MenuItem[] = [];
    
    if (tab !== undefined) {
      items.push({
        label: "Open In NewTab",
        action: () => addTab(tab),
      });
    }

    items.push(
      { label: "Rename", action: () => console.log("Rename") },
      { separator: true },
      { label: "Delete", action: () => console.log("Deleted") }
    );

    return items;
  };
  const openContextMenu = (
    e: React.MouseEvent,
    tab?: TabType,
    items?: MenuItem[],
    style?: CSSProperties
  ) => {
    e.preventDefault();
    const menuItems = items && items.length ? items : preDef(tab);
    setMenu({ x: e.clientX, y: e.clientY, items: menuItems, style });
  };

  // call this to close the menu
  const closeContextMenu = () => setMenu(null);

  // render the menu
  const renderContextMenu = () => {
    if (!menu) return null;
    const defaultMenuStyle: CSSProperties = {
      top: menu.y,
      left: menu.x,
      position: "fixed",
      padding: "4px 0",
      backgroundColor: "#222",
      color: "#fff",
      borderRadius: 4,
      zIndex: 9999,
      minWidth: 140,
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    };
    return (
      <div
        className="contextMenu"
        style={{ ...defaultMenuStyle, ...menu.style }}
        onMouseLeave={closeContextMenu}
      >
        {menu.items.map((item, idx) =>
          item.separator ? (
            <hr key={idx} style={{ margin: "4px 0", borderColor: "#555" }} />
          ) : (
            <div
              key={idx}
              className={"contextMenuItem"}
              onClick={() => {
                item.action!();
                closeContextMenu();
              }}
            >
              {item.label}
            </div>
          )
        )}
      </div>
    );
  };

  return { openContextMenu, closeContextMenu, renderContextMenu };
};

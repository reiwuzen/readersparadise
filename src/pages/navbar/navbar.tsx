import { useState } from "react";
import "../../styles/navbar/navbar.scss";
import selectAndList, { type ImageFile } from "../../../helper/fs";
type NavbarProps = {
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
};
const Navbar = ({ setImages }: NavbarProps) => {
  const [sideBar, setSideBar] = useState(false);

  const ToggleNavbarSideBar = () => {
    setSideBar(!sideBar);
  };

  return (
    <nav className="navbar">
      {
        <div className={`navbarSideBar ${sideBar ? "open" : "closed"} `}>
          <ul className="navbarSideBarList">
            <li onClick={() => {(window as any).openTab("home");setSideBar(!sideBar);}}>Home</li>
            <li onClick={() => {(window as any).openTab("library");setSideBar(!sideBar);}}>Library</li>
            <li onClick={() => {(window as any).openTab("browser");setSideBar(!sideBar);}}>
              Browser
            </li>
            <li onClick={() => {(window as any).openTab("settings");setSideBar(!sideBar);}}>
              Settings
            </li>
          </ul>
        </div>
      }
      <h3>ReadersParadise</h3>
      <button
        onClick={async () => {
          const result = await selectAndList();
          setImages(result);
        }}
      >
        Test
      </button>

      <svg
        className="hamburgerIcon"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        onClick={ToggleNavbarSideBar}
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </nav>
  );
};
export default Navbar;

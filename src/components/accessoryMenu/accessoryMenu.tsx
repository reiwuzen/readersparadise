import "./accessoryMenu.scss";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useDownload } from "@/hooks/useDownload";
import { useDiscover } from "@/hooks/useDiscover";
const AccessoryMenu = () => {
  const { download1Chapter } = useDownload();
  // const {bookChapter, selectedBook} = useDiscover();
  const AMBM = useRef<HTMLSpanElement>(null);
  const AMBP = useRef<HTMLSpanElement>(null);
  const aMenu = useRef<HTMLDivElement>(null);
  const FaMenu = useRef<HTMLDivElement>(null);
  const SaMenu = useRef<HTMLDivElement>(null);
  const TaMenu = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const deg = 360;
  const handleMenuClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (!AMBP.current || !FaMenu.current || !SaMenu.current || !TaMenu.current)
      return;
    if (newState) {
      gsap.to(aMenu.current, {
        right: "0%",
        duration: 0.01,
      });
    } else {
      gsap.to(aMenu.current, {
        right: "-100%",
        duration: 0.65,
      });
    }
    gsap.to(AMBP.current, {
      rotate: newState ? deg : 45,
      duration: 0.65,
      ease: "power2.out",
    });

    const menus = [FaMenu.current, SaMenu.current, TaMenu.current];
    const openDurations = [0.15, 0.2, 0.3];
    const openDelays = [0, 0.1, 0.2];

    menus.forEach((menu, i) => {
      gsap.to(menu, {
        opacity: newState ? 1 : 1,
        right: newState ? "0%" : "-100%",
        ease: newState ? "power2.out" : "power1.in",
        duration: newState ? openDurations[i] : 0.2,
        delay: newState ? openDelays[i] : 0,
      });
    });
  };
  return (
    <div className="accessoryMenu">
      <button
        className={`${isOpen ? "showMenu" : ""}`}
        id="menuBtn"
        onClick={() => {
          handleMenuClick();
        }}
      >
        <span ref={AMBM} id="ambM"></span>
        <span ref={AMBP} id="ambP">
          {"×"}
        </span>
      </button>
      <div ref={aMenu} className={`aMenu ${isOpen ? "showMenu" : ""}`}>
        <div ref={FaMenu} className="FaMenu"></div>
        <div ref={SaMenu} className="SaMenu"></div>
        <div ref={TaMenu} className="TaMenu">
          Ta
          {/*<button
            onClick={() => {
              if(selectedBook && bookChapter){

                download1Chapter(selectedBook.title,bookChapter.ch_no,bookChapter.urls);
              }
            }}
          >
            Download this chapter
          </button>*/}
        </div>
      </div>
    </div>
  );
};
export default AccessoryMenu;

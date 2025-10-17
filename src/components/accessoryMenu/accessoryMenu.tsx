import "./accessoryMenu.scss";
import { useRef, useState } from "react";
import gsap from "gsap";
const AccessoryMenu = () => {
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

    gsap.to(AMBP.current, {
      rotate: newState ? deg : 45, // assuming 0 is the closed rotation
      duration: 0.65,
      ease: "power2.out",
    });

    const menus = [FaMenu.current, SaMenu.current, TaMenu.current];
    const openDurations = [0.15, 0.2, 0.3];
    const openDelays = [0, 0.07, 0.17];

    menus.forEach((menu, i) => {
      
      gsap.to(menu, {
        opacity: newState ? 1 : 0,
        right: newState ? "0%" : "-100%",
        ease: newState ? "power2.out" : "power2.in",
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
        <span ref={AMBM} id="ambM">
          Menu
        </span>
        <span ref={AMBP} id="ambP">
          {"×"}
        </span>
      </button>
      <div ref={aMenu} className={`aMenu ${isOpen ? "showMenu" : ""}`}>
        <div ref={FaMenu} className="FaMenu"></div>
        <div ref={SaMenu} className="SaMenu"></div>
        <div ref={TaMenu} className="TaMenu">
          Ta
        </div>
      </div>
    </div>
  );
};
export default AccessoryMenu;

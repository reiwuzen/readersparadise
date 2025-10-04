import { useState, useRef, useEffect } from "react";

export const useSearchTabs = () => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        console.log("pressed handle click")
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  return { isOpen, inputRef, dropdownRef, buttonRef, open, close };
};

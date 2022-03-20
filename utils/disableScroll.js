import { useEffect } from "react";
export const disableScroll = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      document.body.scroll = "no";
      document.body.style.overflow = "hidden";
      document.height = window.innerHeight;
    } else {
      document.body.scroll = "yes";
      document.body.style.overflow = "auto";
      document.height = "auto";
    }
  }, [isOpen]);
};

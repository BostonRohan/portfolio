import { React, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MobileHome, NavbarHome, MobileNavbar, Navbar } from "./Layout";
import "bootstrap-icons/font/bootstrap-icons.css";
function Nav() {
  //Mobile navbar lines don't display on pages other than home????
  const [mobile, setMobile] = useState(false);
  let location = useLocation();
  const checkDisplay = () => {
    window.innerWidth <= 810 ? setMobile(true) : setMobile(false);
  };
  useEffect(() => {
    checkDisplay();
  }, []);
  window.addEventListener("resize", checkDisplay);
  const responsiveNav = () => {
    if (location.pathname === "/" && mobile) {
      return <MobileHome />;
    } else if (location.pathname === "/" && !mobile) {
      return <NavbarHome />;
    } else if (location.pathname !== "/" && mobile) {
      return <MobileNavbar />;
    } else {
      return <Navbar />;
    }
  };
  return <>{responsiveNav()}</>;
}
export default Nav;

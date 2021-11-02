import { React } from "react";
import { useLocation } from "react-router-dom";
import { NavMenu, NavOnClick } from "./Layout";
import "bootstrap-icons/font/bootstrap-icons.css";
function Nav() {
  let location = useLocation();
  // const checkDisplay = () => {
  //   window.innerWidth <= 810 ? setMobile(true) : setMobile(false);
  // };
  // useEffect(() => {
  //   checkDisplay();
  // }, []);
  // window.addEventListener("resize", checkDisplay);
  const responsiveNav = () => {
    if (location.pathname === "/") {
      return <NavMenu />;
    } else {
      return <NavOnClick />;
    }
  };
  return <>{responsiveNav()}</>;
}
export default Nav;

import { React, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Link as Scroll } from "react-scroll";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";
function Nav() {
  const [isOpen, setOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();
  console.log(history);
  const handleClick = () => {
    if (location.pathname === "/nav") {
      setOpen(false);
      return history.push("/");
    } else {
      setOpen(true);
      return history.goBack();
    }
  };
  console.log(isOpen);
  return (
    <>
      {/* <Scroll
        className="logo"
        activeClass="active"
        to="Home"
        spy={true}
        smooth={true}
      >
        Boston
      </Scroll> */}
      <div className="nav-icon-container" onClick={handleClick}>
        <div className={isOpen ? "animate-bar-1" : "bar1"}></div>
        <div className={isOpen ? "animate-bar-2" : "bar2"}></div>
        <div className={isOpen ? "animate-bar-3" : "bar3"}></div>
      </div>
    </>
  );
}
export default Nav;

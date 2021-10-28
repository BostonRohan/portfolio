import { React, useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import "../Styles/Nav.css";
import "bootstrap-icons/font/bootstrap-icons.css";
function Nav() {
  const [mobile, setMobile] = useState(false);
  let history = useHistory();
  let location = useLocation();
  const responsive = () => {
    window.innerWidth <= 810 ? setMobile(true) : setMobile(false);
  };
  useEffect(() => {
    responsive();
  }, []);
  window.addEventListener("resize", responsive);
  const changeNav = () => {
    if (location.pathname === "/" && mobile) {
      return (
        <>
          <Link to="/" className="mobile-logo">
            Boston
          </Link>
          <Link className="bi-list lines" to="/nav"></Link>
        </>
      );
    } else if (location.pathname === "/" && !mobile) {
      return (
        <>
          <Link className="logo" to="/">
            Boston
          </Link>
          <div className="navbar">
            <ul>
              <li>About Me</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Other</li>
            </ul>
          </div>
        </>
      );
    } else if (location.pathname !== "/" && mobile) {
      return (
        <>
          <Link className="mobile-logo" to="/">
            Boston
          </Link>
          <i className="bi-x-lg x" onClick={() => history.goBack()}></i>
        </>
      );
    } else {
      return (
        <>
          <Link className="logo" to="/">
            Boston
          </Link>
          <div className="navbar">
            <p className="logo">Boston</p>
            <ul>
              <li>About Me</li>
              <li>Projects</li>
              <li>Contact</li>
              <li>Other</li>
            </ul>
          </div>
        </>
      );
    }
  };
  return <>{changeNav()}</>;
}
export default Nav;

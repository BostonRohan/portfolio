import { React, useState, useEffect } from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import "../Styles/Navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";
function Navbar() {
  const [mobile, setMobile] = useState(false);
  const [clicked, setClicked] = useState(false);
  const responsive = () => {
    window.innerWidth <= 810 ? setMobile(true) : setMobile(false);
  };
  useEffect(() => {
    responsive();
  }, []);
  window.addEventListener("resize", responsive);
  const handleClick = () => {
    setClicked(!clicked);
  };
  return (
    <>
      {mobile ? (
        <>
          <Router>
            <Link to="/" className="mobile-logo">
              Boston
            </Link>
          </Router>
          <Router>
            <Link
              className="bi-list lines"
              to="/nav"
              onClick={handleClick}
            ></Link>
          </Router>
        </>
      ) : (
        <>
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
      )}
    </>
  );
}
export default Navbar;

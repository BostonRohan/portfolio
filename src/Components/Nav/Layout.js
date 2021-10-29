import React from "react";
import { useHistory, Link } from "react-router-dom";
import "../../Styles/Nav.css";
export function MobileHome() {
  return (
    <div className="home-mobile-navbar">
      <Link to="/" className="mobile-logo">
        Boston
      </Link>
      <Link className="bi-list lines" to="/nav"></Link>
    </div>
  );
}
export function NavbarHome() {
  return (
    <>
      <Link className="logo" to="/">
        Boston
      </Link>
      <>
        <ul>
          <li>About Me</li>
          <li>Projects</li>
          <li>Contact</li>
          <Link to="/other">
            <li>Other</li>
          </Link>
        </ul>
      </>
    </>
  );
}
export function MobileNavbar() {
  let history = useHistory();
  return (
    <div className="mobile-navbar">
      <Link className="mobile-logo" to="/">
        Boston
      </Link>
      <i className="bi-x-lg x" onClick={() => history.goBack()}></i>
    </div>
  );
}
export function Navbar() {
  return (
    <div className="navbar">
      <Link className="logo" to="/">
        Boston
      </Link>
      <ul>
        <li>About Me</li>
        <li>Projects</li>
        <li>Contact</li>
        <Link to="/other">
          <li>Other</li>
        </Link>
      </ul>
    </div>
  );
}

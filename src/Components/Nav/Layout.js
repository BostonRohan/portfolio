import React from "react";
import { useHistory, Link } from "react-router-dom";
import { Link as Scroll } from "react-scroll";
import "../../Styles/Nav.css";
export function NavMenu() {
  return (
    <div className="nav">
      <Scroll
        className="logo"
        activeClass="active"
        to="Home"
        spy={true}
        smooth={true}
      >
        Boston
      </Scroll>
      <Link className="bi-list lines" to="/nav"></Link>
    </div>
  );
}
export function NavOnClick() {
  let history = useHistory();
  return (
    <div className="nav">
      <Link className="logo" to="/">
        Boston
      </Link>
      <i className="bi-x-lg x" onClick={() => history.goBack()}></i>
    </div>
  );
}

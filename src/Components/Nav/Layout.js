import React from "react";
import { useHistory, Link } from "react-router-dom";
import "../../Styles/Nav.css";
export function NavMenu() {
  return (
    <div className="nav">
      <Link to="/" className="logo">
        Boston
      </Link>
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

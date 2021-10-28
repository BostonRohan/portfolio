import React from "react";
import { Link } from "react-router-dom";
import "../../Styles/Nav.css";

function Other() {
  return (
    <div className="mobile-nav">
      <h2 className="nav-element">About</h2>
      <h2 className="nav-element">Projects</h2>
      <h2 className="nav-element">Contact</h2>
      <Link className="nav-element" to="/other">
        Other
      </Link>
    </div>
  );
}
export default Other;

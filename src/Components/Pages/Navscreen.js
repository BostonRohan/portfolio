import React from "react";
import { Link } from "react-router-dom";
import Footer from "../Footer";
function NavScreen() {
  return (
    <div className="navscreen">
      <Link className="nav-element" to="/about">
        About
      </Link>
      <h2 className="nav-element">Projects</h2>
      <h2 className="nav-element">Contact</h2>
      <Link className="nav-element" to="/other">
        Other
      </Link>
      <Footer />
    </div>
  );
}
export default NavScreen;

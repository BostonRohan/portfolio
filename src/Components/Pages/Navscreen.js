import React from "react";
import { Link } from "react-router-dom";
import Footer from "../Footer";
function NavScreen() {
  return (
    <div className="navscreen">
      <Link className="nav-element" to="/about">
        About
      </Link>
      <Link className="nav-element" to="/projects">
        Projects
      </Link>
      <Link className="nav-element" to="/contact">
        Contact
      </Link>
      <Link className="nav-element" to="/other">
        Other
      </Link>
      <Footer />
    </div>
  );
}
export default NavScreen;

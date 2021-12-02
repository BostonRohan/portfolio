import React from "react";
import { Link } from "react-router-dom";
import Footer from "../../Footer/Footer";
import "./styles.css";
function NavScreen() {
  return (
    <div className="navscreen">
      <Link data-aos="slide-left" className="nav-element" to="/about">
        About
      </Link>
      <Link data-aos="slide-right" className="nav-element" to="/projects">
        Projects
      </Link>
      <Link data-aos="slide-left" className="nav-element" to="/contact">
        Contact
      </Link>
      <Link data-aos="slide-right" className="nav-element" to="/other">
        Other
      </Link>
      <Footer />
    </div>
  );
}
export default NavScreen;

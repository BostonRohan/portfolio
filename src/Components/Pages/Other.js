import React from "react";
import { Link } from "react-router-dom";
import "../../Styles/Nav.css";
import Footer from "../Footer";

function Other() {
  return (
    <div className="navscreen">
      <h2 data-aos="slide-right" id="inactive" className="nav-element">
        Blog
      </h2>
      <h2 data-aos="slide-left" id="inactive" className="nav-element">
        School
      </h2>
      <Link data-aos="slide-right" className="nav-element" to="/resume">
        Resume
      </Link>
      <Footer />
    </div>
  );
}
export default Other;

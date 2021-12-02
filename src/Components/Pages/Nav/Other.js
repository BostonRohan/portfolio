import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import Footer from "../../Footer/Footer";

function Other() {
  return (
    <div className="navscreen">
      <Link data-aos="slide-right" className="nav-element" to="/blog">
        Blog
      </Link>
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

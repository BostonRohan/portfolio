import React from "react";
import "../../Styles/Nav.css";
import Footer from "../Footer";

function Other() {
  return (
    <div className="navscreen">
      <h2 data-aos="slide-right" className="nav-element">
        Blog
      </h2>
      <h2 data-aos="slide-left" className="nav-element">
        School
      </h2>
      <h2 data-aos="slide-right" className="nav-element">
        Resume
      </h2>
      <Footer />
    </div>
  );
}
export default Other;

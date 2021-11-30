import React from "react";
import "../Styles/Footer.css";
import { openInNewTab } from "./Utils/openTab";
function Footer() {
  return (
    <>
      <div className="footer-text">
        <p>Created and Designed by Boston Rohan</p>
        <p className="copyright">&copy; 2022 Boston Rohan</p>
      </div>
      <div className="icons">
        <i
          className="bi-envelope mail"
          onClick={() => openInNewTab("mailto:bostonrohan@gmail.com")}
        ></i>
        <i className="bi-twitter twitter"></i>
        <i
          className="bi-instagram instagram"
          onClick={() => openInNewTab("https://www.instagram.com/bosston.r/")}
        ></i>
        <i
          className="bi-linkedin linkedin"
          onClick={() =>
            openInNewTab("https://www.linkedin.com/in/bostonrohan/")
          }
        ></i>
        <i
          className="bi-github github"
          onClick={() => openInNewTab("https://github.com/BostonRohan")}
        ></i>
      </div>
    </>
  );
}
export default Footer;

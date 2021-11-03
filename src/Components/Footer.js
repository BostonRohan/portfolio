import React from "react";
import "../Styles/Footer.css";
function Footer() {
  const openInNewTab = (url) => {
    return window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <>
      <div className="footer">
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
            openInNewTab("https://www.linkedin.com/in/boston-rohan-a4092b220/")
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

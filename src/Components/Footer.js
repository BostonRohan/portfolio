import React from "react";
import "../Styles/Footer.css";
function Footer() {
  return (
    <>
      <div className="footer">
        <p>Created and Designed by Boston Rohan</p>
        <p className="copyright">&copy; 2022 Boston Rohan</p>
      </div>
      <div className="icons">
        <i className="bi-envelope mail"></i>
        <i className="bi-twitter twitter"></i>
        <i className="bi-instagram instagram"></i>
        <i className="bi-linkedin linkedin"></i>
        <i className="bi-github github"></i>
      </div>
    </>
  );
}
export default Footer;

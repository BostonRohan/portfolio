import React from "react";
import "./styles.css";
import { openInNewTab } from "../../Utils/openTab";
function Footer() {
  return (
    <div className="Footer">
      <section className="columns">
        <div className="column">
          <h3>Main Content</h3>
          <p>About</p>
          <p>Projects</p>
          <p>Contact</p>
        </div>
        <div className="column">
          <h3>Projects</h3>
          <p>Calculator</p>
          <p>Markdown</p>
          <p>Random Quote</p>
          <p>Pomodoro</p>
        </div>
        <div className="column">
          <h3>Other</h3>
          <p>Blogs</p>
          <p>School</p>
          <p>Resume</p>
        </div>
      </section>
      <section className="credit-row">
        <p>Created and Designed by Boston Rohan</p>
        <p>&copy; 2022 Boston Rohan</p>
      </section>
      <section className="footer-icons">
        <i
          className="bi-instagram instagram-icon"
          onClick={() => openInNewTab("https://www.instagram.com/bosston.r/")}
        ></i>
        <i
          className="bi-reddit reddit-icon"
          onClick={() => openInNewTab("https://www.reddit.com/user/Bosstonr")}
        ></i>
        <i
          className="bi-twitter twitter-icon"
          onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
        ></i>
        <i
          className="bi-medium medium-icon"
          onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
        ></i>
        <i
          className="bi-linkedin linkedin-icon"
          onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
        ></i>
      </section>
    </div>
  );
}
export default Footer;

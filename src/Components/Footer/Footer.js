import React from "react";
import { Link as Scroll } from "react-scroll";
import { Link } from "react-router-dom";
import "./styles.css";
import { openInNewTab } from "../../Utils/openTab";
function Footer() {
  return (
    <div className="Footer">
      <section className="columns">
        <div className="column">
          <h3>Main Content</h3>
          <Scroll activeClass="active" spy={true} smooth={true} to="About">
            <p>About</p>
          </Scroll>
          <Scroll activeClass="active" spy={true} smooth={true} to="Projects">
            <p>Projects</p>
          </Scroll>
          <p>Contact</p>
        </div>
        <div className="column">
          <h3>Projects</h3>
          <Link to="/projects/Calculator">
            <p>Calculator</p>
          </Link>
          <Link to="/projects/Markdown">
            <p>Markdown</p>
          </Link>
          <Link to="/projects/Randomquote">
            <p>Random Quote</p>
          </Link>
          <Link to="/projects/Pomodoro">
            <p>Pomodoro</p>
          </Link>
        </div>
        <div className="column">
          <h3>Other</h3>
          <Link to="/blog">
            <p>Blogs</p>
          </Link>
          <Link to="/school">
            <p>School</p>
          </Link>
          <Link to="/resume">
            <p>Resume</p>
          </Link>
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
<<<<<<< HEAD
        <i
          className="bi-twitter twitter"
          onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
        ></i>
=======
>>>>>>> test-branch
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
          onClick={() => openInNewTab("https://medium.com/@bostonrohan")}
        ></i>
        <i
          className="bi-linkedin linkedin-icon"
          onClick={() =>
            openInNewTab("https://www.linkedin.com/in/bostonrohan/")
          }
        ></i>
      </section>
    </div>
  );
}
export default Footer;

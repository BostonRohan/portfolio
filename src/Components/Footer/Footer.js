import React from "react";
import { Link as Scroll } from "react-scroll";
import { Link } from "react-router-dom";
import "./styles.css";
import { openInNewTab } from "../../Utils/openTab";
function Footer() {
  const main = ["About", "Projects", "Contact"];
  const projects = ["Dunker", "Calculator"];
  const other = ["Blog", "School", "Resume", "Hobbies"];
  const year = new Date().getFullYear();
  return (
    <footer className="Footer">
      <div className="content">
        <div className="title">
          <section className="title-icons">
            <h1>Boston Rohan</h1>
            <i
              className="bi-instagram instagram-icon"
              onClick={() =>
                openInNewTab("https://www.instagram.com/bosston.r/")
              }
            />
            <i
              className="bi-linkedin linkedin-icon"
              onClick={() =>
                openInNewTab("https://www.linkedin.com/in/bostonrohan/")
              }
            />
            <i
              className="bi-twitter twitter-icon"
              onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
            />
            <i
              className="bi-medium medium-icon"
              onClick={() => openInNewTab("https://medium.com/@bostonrohan")}
            />
          </section>
          <section className="copyright">
            <p>&copy; Copyright 2021-{year}</p>
            <p>
              <span className="italic">All rights reserved.</span> Created by
              Boston Rohan.
            </p>
          </section>
        </div>
        <div className="main">
          <h2>Main</h2>
          {main.map((title, i) => {
            return (
              <Scroll key={i} to={title} smooth={true}>
                <h3 className="text-underline-hover">{title}</h3>
              </Scroll>
            );
          })}
        </div>
        <div className="projects">
          <h2>Projects</h2>
          {projects.map((title, i) => {
            return (
              <Link key={i} to={`/projects/${title.toLowerCase()}`}>
                <h3 className="text-underline-hover">{title}</h3>
              </Link>
            );
          })}
        </div>
        <div className="other">
          <h2>Other</h2>
          {other.map((title, i) => {
            return (
              <Link key={i} to={title.toLowerCase()}>
                <h3 className="text-underline-hover">{title}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
export default Footer;

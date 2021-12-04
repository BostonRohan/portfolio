import React from "react";
import { openInNewTab } from "../openTab";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";
export function InstagramButton() {
  return (
    <button
      className="instagram-button"
      onClick={() => openInNewTab("https://www.instagram.com/bosston.r/")}
    >
      <i className="bi-instagram instagram-icon"></i>Instagram
    </button>
  );
}
export function GithubButton() {
  return (
    <button
      className="github-button"
      onClick={() => openInNewTab("https://github.com/BostonRohan")}
    >
      <i
        className="bi-github github-icon"
        onClick={() => openInNewTab("https://github.com/BostonRohan")}
      ></i>
      Github
    </button>
  );
}
export function LinkedInButton() {
  return (
    <button
      className="linkedin-button"
      onClick={() => openInNewTab("https://www.linkedin.com/in/bostonrohan/")}
    >
      <i
        className="bi-linkedin linkedin-icon"
        onClick={() => openInNewTab("https://www.linkedin.com/in/bostonrohan/")}
      ></i>
      LinkedIn
    </button>
  );
}
export function MediumButton() {
  return (
    <button
      className="medium-button"
      onClick={() => openInNewTab("https://medium.com/@bostonrohan")}
    >
      <i
        className="bi-medium medium-icon"
        onClick={() => openInNewTab("https://medium.com/@bostonrohan")}
      ></i>
      Medium
    </button>
  );
}
export function TwitterButton() {
  return (
    <button
      className="twitter-button"
      onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
    >
      <i className="bi-twitter twitter-icon"></i>Twitter
    </button>
  );
}
export function RedditButton() {
  return (
    <button
      className="reddit-button"
      onClick={() => openInNewTab("https://www.reddit.com/user/Bosstonr")}
    >
      <i className="bi-reddit reddit-icon"></i>Reddit
    </button>
  );
}

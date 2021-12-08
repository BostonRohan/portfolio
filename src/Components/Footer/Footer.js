import React from "react";
import "./styles.css";
import { openInNewTab } from "../../Utils/openTab";
function Footer() {
  return (
    <div className="Footer">
      <section className="column-1">
        <h2>Mail</h2>
        <h2>LinkedIn</h2>
        <h2>Instagram</h2>
        <h2>Reddit</h2>
        <h2>Medium</h2>
        <h2>Twitter</h2>
      </section>
      <section className="column-2">
        <h2>Home</h2>
        <h2>About</h2>
        <h2>Projects</h2>
        <h2>Contact</h2>
      </section>
      <section className="row">
        <p>Created and Designed by Boston Rohan</p>
        <p className="copyright">&copy; 2022 Boston Rohan</p>
      </section>
    </div>
  );
}
export default Footer;

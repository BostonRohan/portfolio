import React from "react";
import { Link } from "react-router-dom";
function NavScreen() {
  return (
    <div className="mobile-nav">
      <Link className="bi-x-lg x" to="/"></Link>
      <h2>About Me</h2>
      <h2>Projects</h2>
      <h2>Contact</h2>
      <h2>Other</h2>
    </div>
  );
}
export default NavScreen;

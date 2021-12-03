import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Link as Scroll } from "react-scroll";
import { Turn as Hamburger } from "hamburger-react";
import "./styles.css";

function Nav() {
  const [isOpen, setOpen] = useState(false);
  const [isOtherOpen, setOtherOpen] = useState(false);
  let location = useLocation();

  //If the user is not home, and the nav and other are open, display all link tags so a user can travel back home
  if (isOpen && location.pathname !== "/" && isOtherOpen) {
    return (
      <>
        <div className="nav-active">
          <div className="nav-icon">
            <Hamburger
              toggled={isOpen}
              toggle={setOpen}
              size={40}
              hideOutline={false}
            />
          </div>
          <Link className="nav-element" to="/">
            About
          </Link>
          <Link className="nav-element" to="/">
            Projects
          </Link>
          <Link className="nav-element" to="/">
            Contact
          </Link>
          <div className="nav-other-active">
            <Link className="nav-element-other" to="/blog">
              Blog
            </Link>
            <Link className="nav-element-other" to="/school">
              School
            </Link>
            <Link className="nav-element-other" to="/resume">
              Resume
            </Link>
          </div>
        </div>
      </>
    );
    //If a user is not home, and the navigation is open but other is not open, display link tags for navigation and close other
  } else if (!isOtherOpen && isOpen && location.pathname !== "/") {
    return (
      <>
        <div className="nav-active">
          <div className="nav-icon">
            <Hamburger
              toggled={isOpen}
              toggle={setOpen}
              size={40}
              hideOutline={false}
            />
          </div>
          <Link className="nav-element" to="/">
            About
          </Link>
          <Link className="nav-element" to="/">
            Projects
          </Link>
          <Link className="nav-element" to="/">
            Contact
          </Link>
          <h1
            className="nav-element"
            onClick={() => setOtherOpen(!isOtherOpen)}
          >
            Other
          </h1>
        </div>
      </>
    );
    //If the user is at home, and the navigation and other are open display scroll tags for the navigation and link tags for other
  } else if (isOtherOpen && isOpen) {
    return (
      <>
        <div className="nav-active">
          <div className="nav-icon">
            <Hamburger
              toggled={isOpen}
              toggle={setOpen}
              size={40}
              hideOutline={false}
            />
          </div>
          <Scroll
            className="nav-element"
            activeClass="active"
            spy={true}
            smooth={true}
            onClick={() => setOpen(false)}
            to="About"
          >
            About
          </Scroll>
          <Scroll
            className="nav-element"
            activeClass="active"
            spy={true}
            smooth={true}
            onClick={() => setOpen(false)}
            to="Projects"
          >
            Projects
          </Scroll>
          <Scroll
            className="nav-element"
            activeClass="active"
            spy={true}
            smooth={true}
            onClick={() => setOpen(false)}
            to="Contact"
          >
            Contact
          </Scroll>
          <div className="nav-other-active">
            <Link className="nav-element-other" to="/blog">
              Blog
            </Link>
            <Link className="nav-element-other" to="/school">
              School
            </Link>
            <Link className="nav-element-other" to="/resume">
              Resume
            </Link>
          </div>
        </div>
      </>
    );
    //If the user is at home and the navigation is open, but other is not open, display the open navigation with other closed
  } else if (!isOtherOpen && isOpen) {
    return (
      <>
        <div className="nav-active">
          <div className="nav-icon">
            <Hamburger
              toggled={isOpen}
              toggle={setOpen}
              size={40}
              hideOutline={false}
            />
          </div>
          <Scroll
            className="nav-element"
            activeClass="active"
            spy={true}
            smooth={true}
            onClick={() => setOpen(false)}
            to="About"
          >
            About
          </Scroll>
          <Scroll
            className="nav-element"
            activeClass="active"
            spy={true}
            smooth={true}
            onClick={() => setOpen(false)}
            to="Projects"
          >
            Projects
          </Scroll>
          <Scroll
            className="nav-element"
            activeClass="active"
            spy={true}
            smooth={true}
            onClick={() => setOpen(false)}
            to="Contact"
          >
            Contact
          </Scroll>
          <h1
            className="nav-element"
            onClick={() => setOtherOpen(!isOtherOpen)}
          >
            Other
          </h1>
        </div>
      </>
    );
    //If the user closes the nav, then set other to false, the nav is no longer open
  } else if (isOtherOpen && !isOpen) setOtherOpen(false);
  //Otherwise return the closed navigation
  else {
    return (
      <div className="nav">
        <div className="nav-icon">
          <Hamburger
            toggled={isOpen}
            toggle={setOpen}
            size={40}
            hideOutline={false}
          />
        </div>
      </div>
    );
  }
}
export default Nav;

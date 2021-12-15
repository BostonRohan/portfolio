import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Link as Scroll, scroller } from "react-scroll";
import { Turn as Hamburger } from "hamburger-react";
import { motion } from "framer-motion";
import Toggle from "./Toggle/Toggle";
import "./styles.css";

function Nav() {
  const [isOpen, setOpen] = useState(false);
  const [isOtherOpen, setOtherOpen] = useState(false);
  const [scrollTo, setScrollTo] = useState("");
  let location = useLocation();
  let home = location.pathname === "/";

  //Navigation Layouts
  function OpenReturnToHomeNav() {
    return (
      <>
        <Link
          className="nav-element"
          to="/"
          onClick={() => setScrollTo("About")}
        >
          About
        </Link>
        <Link
          className="nav-element"
          to="/"
          onClick={() => setScrollTo("Projects")}
        >
          Projects
        </Link>
        <Link
          className="nav-element"
          to="/"
          onClick={() => setScrollTo("Contact")}
        >
          Contact
        </Link>
      </>
    );
  }
  function OpenHomeNav() {
    return (
      <>
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
      </>
    );
  }
  function OpenOther() {
    return (
      <>
        <Link
          className="nav-element-other"
          to="/blog"
          onClick={() => setOpen(false)}
        >
          Blog
        </Link>
        <Link
          className="nav-element-other"
          to="/school"
          onClick={() => setOpen(false)}
        >
          School
        </Link>
        <Link
          className="nav-element-other"
          to="/resume"
          onClick={() => setOpen(false)}
        >
          Resume
        </Link>
      </>
    );
  }
  function ClosedOther() {
    return (
      <h1 className="nav-element" onClick={() => setOtherOpen(!isOtherOpen)}>
        Other
      </h1>
    );
  }
  //Function that scrolls to section of the page based on scrollTo state, only rerendered when scrollTo state has changed
  const scrollToSection = useCallback(() => {
    return scroller.scrollTo(scrollTo, {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  }, [scrollTo]);

  useEffect(() => {
    const scrollToTimer = setTimeout(() => {
      //Scrolls to the section after .5 seconds, allowing the Link tag to route back to the home page first
      scrollToSection();
      //Closing the navigation, the user has requested to scroll to a section
      setOpen(false);
    }, 500);
    //Clearing the timer effectively
    return () => clearTimeout(scrollToTimer);
  }, [scrollToSection]);

  //If the user is not home, open both navigations with link tags, to travel back home
  if (isOpen && !home && isOtherOpen) {
    return (
      <div className="nav-active">
        <Hamburger
          toggled={isOpen}
          toggle={setOpen}
          size={40}
          hideOutline={false}
        />
        <Toggle />
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "linear" }}
          className="nav-elements"
        >
          <OpenReturnToHomeNav />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "linear" }}
          className="nav-other-active"
        >
          <OpenOther />
        </motion.div>
      </div>
    );
    //If a user is not home, and other navigation is closed, display an open nav with links, and a closed other nav
  } else if (!isOtherOpen && isOpen && !home) {
    return (
      <div className="nav-active">
        <Hamburger
          duration={0.8}
          toggled={isOpen}
          toggle={setOpen}
          size={40}
          hideOutline={false}
        />
        <Toggle />
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "linear" }}
          className="nav-elements"
        >
          <OpenReturnToHomeNav />
          <ClosedOther />
        </motion.div>
      </div>
    );
    //If the user is at home, and both navigations are open, display open navigations
  } else if (isOtherOpen && isOpen) {
    return (
      <div className="nav-active">
        <Hamburger
          duration={0.8}
          toggled={isOpen}
          toggle={setOpen}
          size={40}
          hideOutline={false}
        />
        <Toggle />
        <div className="nav-elements">
          <OpenHomeNav />
        </div>
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "linear" }}
          className="nav-other-active"
        >
          <OpenOther />
        </motion.div>
      </div>
    );
    //If the user is at home and the navigation is open but the other navigation is closed, display the open navigation and the closed other
  } else if (!isOtherOpen && isOpen) {
    return (
      <div className="nav-active">
        <Hamburger
          duration={0.8}
          toggled={isOpen}
          toggle={setOpen}
          size={40}
          hideOutline={false}
        />
        <Toggle />
        <motion.div
          initial={{ opacity: 0, x: -200 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "linear" }}
          className="nav-elements"
        >
          <OpenHomeNav />
          <ClosedOther />
        </motion.div>
      </div>
    );
    //If the user closes the nav, then set other navigation to false, the nav is no longer open
  } else if (isOtherOpen && !isOpen) setOtherOpen(false);
  //Otherwise return the closed navigation
  else {
    return (
      <div className="nav">
        <Hamburger
          duration={0.8}
          toggled={isOpen}
          toggle={setOpen}
          size={40}
          hideOutline={false}
        />
        <Toggle />
      </div>
    );
  }
}
export default Nav;

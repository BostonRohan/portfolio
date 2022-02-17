import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import { Turn as Hamburger } from "hamburger-react";
import { motion } from "framer-motion";
import Toggle from "./Toggle/Toggle";
import Profile from "./Profile/Profile";
import "./styles.css";

function Nav() {
  const [isOpen, setOpen] = useState(false);
  const [isOtherOpen, setOtherOpen] = useState(false);
  const nav = ["About", "Projects", "Contact"];
  const other = ["Blog", "School", "Resume", "Hobbies"];
  let location = useLocation();
  let home = location.pathname === "/";

  const handleClick = (element) => {
    setOpen(false);
    setTimeout(
      () =>
        scroller.scrollTo(element, {
          duration: 1000,
          delay: 0,
          smooth: "easeInOutQuart",
        }),
      200
    );
  };
  return (
    <div className="nav">
      <Profile isHome={home} />
      <Toggle />
      {isOpen ? (
        <div className="nav-active">
          <Hamburger
            toggled={isOpen}
            toggle={setOpen}
            size={40}
            hideOutline={false}
          />
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "linear" }}
            className="nav-elements"
          >
            {nav.map((element, i) => {
              if (home)
                return (
                  <h1
                    key={i}
                    className="nav-element"
                    onClick={() => handleClick(element)}
                  >
                    {element}
                  </h1>
                );
              else
                return (
                  <Link
                    key={i}
                    className="nav-element"
                    to="/"
                    onClick={() => handleClick(element)}
                  >
                    {element}
                  </Link>
                );
            })}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "linear" }}
            className="nav-other-active"
          >
            {isOtherOpen ? (
              <>
                {other.map((element, i) => {
                  return (
                    <Link
                      key={i}
                      className="nav-element-other"
                      to={`/${element.toLowerCase()}`}
                      onClick={() => setOpen(false)}
                    >
                      {element}
                    </Link>
                  );
                })}
              </>
            ) : (
              <h1 className="nav-element" onClick={() => setOtherOpen(true)}>
                Other
              </h1>
            )}
          </motion.div>
        </div>
      ) : (
        <div>
          <Hamburger
            duration={0.8}
            toggled={isOpen}
            toggle={setOpen}
            size={40}
            hideOutline={false}
          />
        </div>
      )}
    </div>
  );
}
export default Nav;

import React from "react";
import { motion } from "framer-motion";
import Loading from "../Utils/loading/loading";
import Home from "./Home/Home";
import About from "./About/About";
import Projects from "./Projects/Projects";
import Contact from "./Contact/Contact";
import Footer from "./Footer/Footer";

function Main() {
  //Snowflakes
  const snowflakes = new Array(100).fill(0);
  return (
    <main>
      <Loading />
      {snowflakes.map((item, index) => {
        return (
          <motion.i
            key={index}
            style={{
              color: "white",
              position: "absolute",
              overflow: "hidden",
              /*Randomly position snowflakes on screen */
              left: Math.random() * window.innerWidth + "px",
            }}
            initial={{ y: -20 }}
            animate={{
              y: 3600,
              transitionEnd: {
                display: "none",
              },
              transition: {
                delay: Math.random() * 50,
                duration: 35,
                repeat: Infinity,
              },
            }}
            className="bi bi-snow"
          ></motion.i>
        );
      })}
      {snowflakes.map((item, index) => {
        return (
          <motion.i
            key={index}
            style={{
              /*Make the snowflakes visible on both light and dark theme */
              color: "SkyBlue",
              position: "absolute",
              overflow: "hidden",
              /*Randomly position snowflakes on screen */
              left: Math.random() * window.innerWidth + "px",
            }}
            initial={{ y: -20 }}
            animate={{
              y: 3600,
              transitionEnd: {
                display: "none",
              },
              transition: {
                delay: Math.random() * 25,
                duration: 30,
                repeat: Infinity,
              },
            }}
            className="bi bi-snow"
          ></motion.i>
        );
      })}
      <Home />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
export default Main;
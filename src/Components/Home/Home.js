import React, { useEffect } from "react";
import "./styles.css";
import { Link as Scroll } from "react-scroll";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function Home() {
  const { inView, ref } = useInView({ threshold: 0.5 });
  const animation = useAnimation();
  useEffect(() => {
    if (inView) {
      animation.start({
        opacity: 1,
        x: 0,
        transition: {
          type: "linear",
        },
      });
    } else {
      animation.start({
        opacity: 0,
        x: -200,
      });
    }
  }, [inView, animation]);
  return (
    <div ref={ref} className="Home">
      <motion.section animate={animation} className="title-section">
        <h1>Boston Rohan</h1>
        <h3>
          Passionate Full-Stack Developer interning currently at{" "}
          <span className="text-underline-hover">Snapbrillia</span>, I love to{" "}
          <span className="text-underline-hover">code</span>,{" "}
          <span className="text-underline-hover">listen to music</span>,{" "}
          <span className="text-underline-hover">read</span>, spend time with my
          family, and{" "}
          <span className="text-underline-hover">watch television</span>.
        </h3>
        <Scroll activeClass="active" spy={true} smooth={true} to="Contact">
          <button className="hire-me">Hire me</button>
        </Scroll>
      </motion.section>
    </div>
  );
}
export default Home;

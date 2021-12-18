import React, { useEffect } from "react";
import "./styles.css";
import { Link as Scroll } from "react-scroll";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

function Home() {
  const backgroundStyles = {
    backgroundImage: 'url("../../Full body photo.jpg")',
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
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
    <div ref={ref} className="Home" style={backgroundStyles}>
      <motion.section animate={animation} className="title-section">
        <h1>Boston Rohan</h1>
        <Scroll activeClass="active" spy={true} smooth={true} to="Contact">
          <button>Hire me</button>
        </Scroll>
      </motion.section>
    </div>
  );
}
export default Home;

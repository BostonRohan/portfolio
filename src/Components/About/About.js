import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./styles.css";

function About() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const textAnimation = useAnimation();

  useEffect(() => {
    //If the content is in view, start the animations
    if (inView) {
      textAnimation.start({
        x: 0,
        transition: {
          delay: 0.5,
          type: "tween",
          duration: 1.5,
        },
      });
    } else {
      textAnimation.start({ x: "100vw" });
    }
  }, [inView, textAnimation]);
  return (
    <div ref={ref} className="About">
      <h2 className="about-title">Who is Boston Rohan?</h2>
      <article className="about-me">
        <img
          className="personal-photo"
          src="./full-body.jpg"
          alt="Boston Rohan"
        />
        <motion.p animate={textAnimation}>
          Hey! I'm Boston, a self-taught web developer. I started learn how to
          code during qurantine because I was in search of controllable
          problems. So many things during that time, and even now, are out of
          our control. Coding was my outlet to create, and problem solve. Being
          a self-taught developer is difficult, and I am thankful to have had
          various mentors along the way. I hope to take the knowledge that I've
          gained and apply it further to benefit myself and others.
        </motion.p>
      </article>
    </div>
  );
}
export default About;

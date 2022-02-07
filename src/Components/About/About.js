import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { openInNewTab } from "../../Utils/openTab";
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
      <article className="about-me">
        <img
          className="personal-photo"
          src="./Headshots/Pesonal Headshot.jpg"
          alt="Profile Icon"
        />
        <motion.p animate={textAnimation}>
          Hey! I'm Boston, a self-taught web developer. I love to create modern
          and effective web applications for people to enjoy. I am a fast
          learner, and adapt quickly to fast paced environments. I enjoy
          collaboration, and will do the best I can to bring the best out of my
          teammates. I have been learning the <b>MERN</b> stack with MongoDB,
          Express, React and Node. I am certain that web development is my
          calling to serve others with clean, good-looking, and efficient web
          applications. By turning my hobby into a career I hope to serve
          myself, my family, and my community.
        </motion.p>
      </article>
    </div>
  );
}
export default About;

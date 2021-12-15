import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { openInNewTab } from "../../Utils/openTab";
import "./styles.css";

function About() {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const imageAnimation = useAnimation();
  const textAnimation = useAnimation();
  const iconAnimation = useAnimation();

  useEffect(() => {
    //If the content is in view, start the animations
    if (inView) {
      imageAnimation.start({
        x: 0,
        transition: {
          type: "tween",
          duration: 1.5,
        },
      });
      textAnimation.start({
        x: 0,
        transition: {
          delay: 0.5,
          type: "tween",
          duration: 1.5,
        },
      });
      iconAnimation.start({
        opacity: 1,
        transition: {
          easeIn: 2,
          duration: 2,
        },
      });
    } else {
      iconAnimation.start({ opacity: 0 });
      imageAnimation.start({ x: "-100vw" });
      textAnimation.start({ x: "100vw" });
    }
  }, [inView, textAnimation, imageAnimation, iconAnimation]);
  return (
    <div ref={ref} className="About">
      <article className="about-me">
        <motion.img
          animate={imageAnimation}
          className="personal-photo"
          src="./Headshots/Pesonal Headshot.jpg"
          alt="Profile Icon"
        />
        <motion.section animate={iconAnimation} className="about-icons">
          <i
            className="bi-instagram instagram-icon"
            onClick={() => openInNewTab("https://www.instagram.com/bosston.r/")}
          ></i>
          <i
            className="bi-linkedin linkedin-icon"
            onClick={() =>
              openInNewTab("https://www.linkedin.com/in/bostonrohan/")
            }
          ></i>
          <i
            className="bi-twitter twitter-icon"
            onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
          ></i>
        </motion.section>
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

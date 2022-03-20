import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Link as Scroll } from "react-scroll";
import styles from "../styles/landing.module.css";
import { openInNewTab } from "../utils/openTab";
import { useRouter } from "next/router";
import { scroll } from "../utils/scroll";

function Landing() {
  const { inView, ref } = useInView({ threshold: 0.5 });
  const router = useRouter();
  const animation = useAnimation();
  const hobbyText = ["listen to music", "read", "watch anime"];

  const handleClick = (element) => {
    router.push("/hobbies");
    setTimeout(() => scroll(element), 1500);
  };
  useEffect(() => {
    if (inView) {
      animation.start({
        opacity: 1,
        x: 0,
        transition: {
          type: "linear",
          delay: 0.5,
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
    <div ref={ref} className={`${styles.page} landing`}>
      <motion.section animate={animation} className={styles.section}>
        <h1>Boston Rohan</h1>
        <h3>
          Passionate Full-Stack Developer interning currently at{" "}
          <span
            className="link"
            onClick={() => openInNewTab("https://www.snapbrillia.com/")}
          >
            Snapbrillia
          </span>
          , I love to{" "}
          <Scroll smooth={true} to="Projects">
            <span className="link">code</span>
          </Scroll>
          ,{" "}
          {hobbyText.map((text, i) => {
            return (
              <span key={i} className="link" onClick={() => handleClick(text)}>
                {i === hobbyText.length - 1
                  ? ` and ${" "}${text}.`
                  : `${" "}${text},`}
              </span>
            );
          })}
        </h3>
        <Scroll activeClass="active" spy={true} smooth={true} to="Contact">
          <button className="button">Connect with me</button>
        </Scroll>
        <section className={styles.icons}>
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
        </section>
      </motion.section>
    </div>
  );
}
export default Landing;

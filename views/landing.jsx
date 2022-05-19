import { Link as Scroll } from "react-scroll";
import styles from "../styles/landing.module.css";
import src from "../public/full.jpg";
import Image from "next/image";

function Landing() {
  return (
    <div className={`${styles.page}`}>
      <div className={`gradient ${styles.g1}`} />
      <div className={`gradient ${styles.g2}`} />
      <section className={styles.section}>
        <section className={styles.image_section}>
          <Image
            src={src}
            quality={100}
            priority={true}
            alt="Boston Rohan"
            className={styles.image}
          />
        </section>
        <h1>Boston Rohan</h1>
        <h3>
          Passionate Full-Stack Developer currently developing my skills and
          looking for opprotunities, I love to{" "}
          <Scroll smooth={true} to="Projects">
            <span className="link">code</span>
          </Scroll>
          ,{" "}
          <a
            href="https://open.spotify.com/user/12151292580?si=908c62d3ccc04bf3"
            target="_blank"
            className="link"
          >
            listen to music
          </a>
          ,{" "}
          <a
            href="https://burnt-barberry-533.notion.site/reading-directory-8155bf8f6c59429791db4fa0991464b5"
            target="_blank"
            className="link"
          >
            read
          </a>
          , and{" "}
          <a
            href="https://anilist.co/user/bosston/"
            className="link"
            target="_blank"
          >
            watch anime
          </a>
          .
        </h3>
        <Scroll activeClass="active" spy={true} smooth={true} to="Contact">
          <button className="button">Connect with me</button>
        </Scroll>
        <section className={styles.icons}>
          <a href="https://www.instagram.com/bosston.r/" target="_blank">
            <i className="bi-instagram instagram-icon"></i>
          </a>
          <a href="https://www.linkedin.com/in/bostonrohan/" target="_blank">
            <i className="bi-linkedin linkedin-icon"></i>
          </a>
          <a href="https://twitter.com/BostonRohan" target="_blank">
            <i className="bi-twitter twitter-icon"></i>
          </a>
        </section>
      </section>
    </div>
  );
}
export default Landing;

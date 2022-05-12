import { Link as Scroll } from "react-scroll";
import Link from "next/link";
import styles from "../styles/footer.module.css";

function Footer() {
  const main = ["Projects", "Contact"];
  const projects = ["Oshun", "Dunker", "Calculator"];
  const other = ["Blog"];
  const year = new Date().getFullYear();
  return (
    <footer className={`${styles.page} Footer`}>
      <div className={styles.content}>
        <div className={styles.title}>
          <section className={styles.icons}>
            <h1>Boston Rohan</h1>
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
          <section className={styles.copyright}>
            <p>&copy; Copyright {year}</p>
            <p>
              <span className={styles.italic}>All rights reserved.</span>{" "}
              Created by Boston Rohan.
            </p>
          </section>
        </div>
        <div className={styles.main}>
          <h2>Main</h2>
          {main.map((title) => {
            if (title === "Contact")
              return (
                <a href="mailto:bostonrohan@gmail.com" key={title}>
                  <h3 className="link">{title}</h3>
                </a>
              );
            else
              return (
                <Scroll key={title} to={title} smooth={true}>
                  <h3 className="link">{title}</h3>
                </Scroll>
              );
          })}
        </div>
        <div className={styles.projects}>
          <h2>Projects</h2>
          {projects.map((title) => {
            return (
              <Scroll key={title} to="Projects" smooth={true}>
                <h3 className="link">{title}</h3>
              </Scroll>
            );
          })}
        </div>
        <div className={styles.other}>
          <h2>Other</h2>
          {other.map((title, i) => {
            return (
              <Link key={i} href={title.toLowerCase()}>
                <h3 className="link">{title}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
export default Footer;

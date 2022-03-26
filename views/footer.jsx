import { Link as Scroll } from "react-scroll";
import { openInNewTab } from "../utils/openTab";
import Link from "next/link";
import styles from "../styles/footer.module.css";

function Footer() {
  const main = ["About", "Projects", "Contact"];
  const projects = ["Dunker", "Calculator"];
  const other = ["Blog", "School", "Resume", "Hobbies"];
  const year = new Date().getFullYear();
  return (
    <footer className={`${styles.page} Footer`}>
      <div className={styles.content}>
        <div className={styles.title}>
          <section className={styles.icons}>
            <h1>Boston Rohan</h1>
            <i
              className="bi-instagram instagram-icon"
              onClick={() =>
                openInNewTab("https://www.instagram.com/bosston.r/")
              }
            />
            <i
              className="bi-linkedin linkedin-icon"
              onClick={() =>
                openInNewTab("https://www.linkedin.com/in/bostonrohan/")
              }
            />
            <i
              className="bi-twitter twitter-icon"
              onClick={() => openInNewTab("https://twitter.com/BostonRohan")}
            />
            <i
              className="bi-medium medium-icon"
              onClick={() => openInNewTab("https://medium.com/@bostonrohan")}
            />
          </section>
          <section className={styles.copyright}>
            <p>&copy; Copyright 2021-{year}</p>
            <p>
              <span className={styles.italic}>All rights reserved.</span>{" "}
              Created by Boston Rohan.
            </p>
          </section>
        </div>
        <div className={styles.main}>
          <h2>Main</h2>
          {main.map((title, i) => {
            return (
              <Scroll key={i} to={title} smooth={true}>
                <h3 className="link">{title}</h3>
              </Scroll>
            );
          })}
        </div>
        <div className={styles.projects}>
          <h2>Projects</h2>
          {projects.map((title, i) => {
            return (
              <Link
                key={i}
                href={{
                  pathname: "/projects/[name]",
                  query: { name: title.toLowerCase() },
                }}
              >
                <h3 className="link">{title}</h3>
              </Link>
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

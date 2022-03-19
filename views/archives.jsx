import { openInNewTab } from "../utils/openTab";
import styles from "../styles/archives.module.css";

function Archives() {
  const pages = [
    "home.png",
    "reccomendation.png",
    "about.png",
    "projects.png",
    "contact.png",
  ];

  return (
    <div className={`${styles.page} Archive`}>
      <h1>Website Archives</h1>
      <section className={styles.section}>
        <h2>Version 1</h2>
        {pages.map((src, i) => {
          return (
            <img
              key={i}
              src={`../Projects/Website/v1/${src}`}
              alt=""
              onClick={() => openInNewTab("https://bostonrohanv1.netlify.app/")}
            />
          );
        })}
      </section>
      <section className={styles.section}>
        <h2>Version 2</h2>
        {pages
          .filter((src) => src !== "reccomendation.png")
          .map((src, i) => {
            return (
              <img
                key={i}
                onClick={() =>
                  openInNewTab("https://bostonrohanv2.netlify.app")
                }
                src={`../Projects/Website/v2/${src}`}
                alt=""
              />
            );
          })}
      </section>
    </div>
  );
}
export default Archives;

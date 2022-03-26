import { openInNewTab } from "../utils/openTab";
import styles from "../styles/archives.module.css";
import Image from "next/image";

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
            <Image
              className={styles.image}
              key={i}
              src={`/Projects/Website/v1/${src}`}
              alt="Boston Rohan Archive Website Version 1"
              width={900}
              height={500}
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
              <Image
                key={i}
                className={styles.image}
                onClick={() =>
                  openInNewTab("https://bostonrohanv2.netlify.app")
                }
                width={900}
                height={500}
                src={`/Projects/Website/v2/${src}`}
                alt="Boston Rohan Archive Website Version 2"
              />
            );
          })}
      </section>
    </div>
  );
}
export default Archives;

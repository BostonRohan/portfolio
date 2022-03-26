import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { openInNewTab } from "../../utils/openTab";
import { data } from "../../utils/projects/data";
import styles from "../../styles/project.module.css";
import Loading from "../../utils/loading/loading";
import Image from "next/image";

function Project() {
  let router = useRouter();
  let checkProject = data.map((obj) => obj.name === router.query.name);
  let index = checkProject.indexOf(true);
  return (
    <>
      <Loading />
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "linear" }}
        className="Project"
      >
        {index >= 0 && (
          <>
            <section className={styles.images}>
              {data[index].images.map((src, i) => {
                return (
                  <Image
                    key={i}
                    onClick={() => openInNewTab(data[index].site)}
                    src={src}
                    alt={data[index].name}
                    width={1600}
                    height={1000}
                  />
                );
              })}
            </section>
            <section className={styles.icons}>
              <i
                className="bi bi-github"
                onClick={() => openInNewTab(data[index].repo)}
              />
              <i
                className="bi bi-box-arrow-up-right"
                onClick={() => openInNewTab(data[index].site)}
              />
            </section>
            <section className={styles.content}>
              <h1>Description</h1>
              <p>{data[index].description}</p>
              <section className={styles.technologies}>
                <h2>Technologies Used</h2>
                {data[index].technologies.map((icon, i) => {
                  return <i key={i} className={icon} />;
                })}
              </section>
              <h1>What I've learned</h1>
              <p>{data[index].learned}</p>
            </section>
          </>
        )}
      </motion.div>
    </>
  );
}
export default Project;

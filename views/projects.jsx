import { openInNewTab } from "../utils/openTab";
import { data } from "../utils/projects/data";
import Link from "next/link";
import styles from "../styles/projects.module.css";

function Projects() {
  return (
    <div className="Projects">
      <h1 className={styles.h1}>Projects</h1>
      {data.map((project, i) => {
        return (
          <section key={i} className={i % 2 === 0 ? "right" : "left"}>
            <Link
              href={{
                pathname: "/projects/[name]",
                query: { name: data[i]["name"] },
              }}
            >
              <img src={data[i]["images"][i]} alt={project.name} />
            </Link>
            <p>{data[i]["description"]}</p>
            <section className={styles.icons}>
              <i
                className="bi bi-github"
                onClick={() => openInNewTab(data[i]["repo"])}
              />
              <i
                className="bi bi-box-arrow-up-right"
                onClick={() => openInNewTab(data[i]["site"])}
              />
            </section>
          </section>
        );
      })}
    </div>
  );
}
export default Projects;

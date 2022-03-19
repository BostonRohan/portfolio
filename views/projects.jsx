import { openInNewTab } from "../utils/openTab";
import { data } from "../utils/projects/data";
import Link from "next/link";

function Projects() {
  return (
    <div className="Projects">
      <h1>Projects</h1>
      {data.map((project, i) => {
        return (
          <section
            key={i}
            className={i % 2 === 0 ? "project-right" : "project-left"}
          >
            <Link href={`/projects/${data[i]["name"]}`}>
              <img src={data[i]["images"][i]} alt={project} />
            </Link>
            <p>{data[i]["description"]}</p>
            <section className="project-icons">
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

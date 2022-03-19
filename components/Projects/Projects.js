import React from "react";
import { Link } from "react-router-dom";
import { openInNewTab } from "../../Utils/openTab";
import { projectInfo } from "./projectInfo";
import "./styles.css";

function Projects() {
  return (
    <div className="Projects">
      <h1>Projects</h1>
      {projectInfo.map((project, i) => {
        return (
          <section
            key={i}
            className={i % 2 === 0 ? "project-right" : "project-left"}
          >
            <Link to={`/projects/${projectInfo[i]["name"]}`}>
              <img src={projectInfo[i]["images"][i]} alt={project} />
            </Link>
            <p>{projectInfo[i]["description"]}</p>
            <section className="project-icons">
              <i
                className="bi bi-github"
                onClick={() => openInNewTab(projectInfo[i]["repo"])}
              />
              <i
                className="bi bi-box-arrow-up-right"
                onClick={() => openInNewTab(projectInfo[i]["site"])}
              />
            </section>
          </section>
        );
      })}
    </div>
  );
}
export default Projects;

import { React, useState } from "react";
import { openInNewTab } from "../../Utils/openTab";
import { projectInfo } from "./projectInfo";
import "./styles.css";

function Projects() {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  return (
    <div className="Projects">
      <section className="project-title-section">
        <h1 className="project-title">Projects</h1>
      </section>
      <section className="project-image">
        <img
          className={projectInfo[index].className}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          src={
            index === 0 && hover
              ? projectInfo[0].imageLink2
              : projectInfo[index].imageLink
          }
          alt="Project"
        />
        <section className="image-toggle">
          <span
            className="dot"
            id={index === 0 ? "dot-active" : ""}
            onClick={() => setIndex(0)}
          ></span>
          <span
            className="dot"
            id={index === 1 ? "dot-active" : ""}
            onClick={() => setIndex(1)}
          ></span>
          <span
            className="dot"
            id={index === 2 ? "dot-active" : ""}
            onClick={() => setIndex(2)}
          ></span>
          <span
            className="dot"
            id={index === 3 ? "dot-active" : ""}
            onClick={() => setIndex(3)}
          ></span>
        </section>
      </section>
      <section className="project-description">
        <p>{projectInfo[index].description}</p>
      </section>
      <section className="project-buttons">
        <button
          className="github-repo"
          onClick={() => openInNewTab(projectInfo[index].repoLink)}
        >
          <i className="bi bi-github"></i> Repository
        </button>
        <button
          className="live-site"
          onClick={() => openInNewTab(projectInfo[index].liveSiteLink)}
        >
          <i className="bi bi-box-arrow-up-right"></i> Live Site
        </button>
      </section>
    </div>
  );
}
export default Projects;

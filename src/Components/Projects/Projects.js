import { React, useState } from "react";
import { openInNewTab } from "../../Utils/openTab";
import { projectInfo } from "./projectInfo";
import "./styles.css";

function Projects() {
  const [index, setIndex] = useState(0);
  return (
    <div className="Projects">
      <h1>Projects</h1>
      <div>
        <img src={projectInfo[index].imageLink} alt="calculator icon" />
        <p>{projectInfo[index].description}</p>
        <i
          className="bi bi-github"
          onClick={() => openInNewTab(projectInfo[index].repoLink)}
        ></i>
        <i
          className="bi bi-box-arrow-up-right"
          onClick={() => openInNewTab(projectInfo[index].liveSiteLink)}
        ></i>
      </div>
      <div className="box-2">
        <img src="./Projects/pomodoro.png" alt="pomodoro timer" />
        <i
          className="bi bi-github"
          onClick={() => openInNewTab(projectInfo[1].repoLink)}
        ></i>
        <i
          className="bi bi-box-arrow-up-right"
          onClick={() => openInNewTab(projectInfo[1].liveSiteLink)}
        ></i>
      </div>
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
      <section className="buttons">
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

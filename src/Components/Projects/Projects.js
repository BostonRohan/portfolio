import { React, useState } from "react";
import { openInNewTab } from "../../Utils/openTab";
import { projectInfo } from "./projectInfo";
import "./styles.css";

function Projects() {
  const [index, setIndex] = useState(0);

  return (
    <div className="Projects">
      <section className="title-section">
        <h1 className="title">Projects</h1>
      </section>
      {/* <section className="circle-section">
          <div className="circle"></div> */}
      <section className="project-images">
        <img
          className={projectInfo[index].className}
          src={
            index === 0
              ? projectInfo[0].imageLink1
              : projectInfo[index].imageLink
          }
          alt="Project"
          onClick={() => openInNewTab(projectInfo[index].liveSiteLink)}
        />
        <img
          className={
            index === 0 ? projectInfo[0].className : "second-image-inactive"
          }
          src={index === 0 ? projectInfo[0].imageLink2 : ""}
          alt="Project"
          onClick={() => openInNewTab(projectInfo[0].liveSiteLink)}
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
    </div>
  );
}
export default Projects;

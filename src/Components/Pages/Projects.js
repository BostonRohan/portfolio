import { React, useState } from "react";
import "../../Styles/Projects.css";
import { openInNewTab } from "../Utils/openTab";
import { projectInfo } from "../Utils/projectInfo";

function Projects() {
  const [projectIndex, setProjectIndex] = useState(0);
  console.log(projectInfo[projectIndex].videoLink);
  return (
    <div className="Projects">
      <h1 data-aos="slide-left" className="project-title">
        Projects
      </h1>
      <div data-aos="fade-in" className="project-image-section">
        <section className="arrows">
          <i
            className="bi-arrow-right-circle-fill arrow-right"
            //If projectIndex is less than the max number of projects then increase, otherwise return, stopping errors.
            onClick={() => {
              if (projectIndex < 3) setProjectIndex(projectIndex + 1);
              else return;
            }}
          ></i>
          <i
            className="bi-arrow-left-circle-fill arrow-left"
            //If projectIndex is greater than 0 then decrease, otherwise return, stopping errors.
            onClick={() => {
              if (projectIndex > 0) setProjectIndex(projectIndex - 1);
              else return;
            }}
          ></i>
        </section>
        <video
          src={projectInfo[projectIndex].videoLink}
          type={projectInfo[projectIndex].videoType}
          onClick={() => openInNewTab(projectInfo[projectIndex].liveSiteLink)}
          autoPlay
          muted
        ></video>
      </div>
      <section data-aos="fade-in" className="project-description">
        <p>{projectInfo[projectIndex].description}</p>
      </section>
      <div data-aos="fade-in" className="tech-stack-icons">
        <i className="devicon-react-original"></i>
        <i className="devicon-css3-plain"></i>
        <i className="devicon-html5-plain"></i>
      </div>
      <i
        className="bi-github github-logo"
        onClick={() => openInNewTab(projectInfo[projectIndex].repoLink)}
      ></i>
    </div>
  );
}
export default Projects;

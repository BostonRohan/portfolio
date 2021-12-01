import { React, useState, useEffect } from "react";
import "../../Styles/Projects.css";
import { openInNewTab } from "../Utils/openTab";
import { projectInfo } from "../Utils/projectInfo";

function Projects() {
  const [projectIndex, setProjectIndex] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  let isMobile = width <= 768;

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };
  //Check if a user is on mobile, videos won't play on mobile...
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  function ProjectContent() {
    if (projectIndex === 0 && isMobile) {
      return (
        <>
          <img
            className={projectInfo[projectIndex].className}
            src={projectInfo[projectIndex].imageLink1}
            alt="Project"
            onClick={() => openInNewTab(projectInfo[projectIndex].liveSiteLink)}
          />
          <img
            className={projectInfo[projectIndex].className}
            src={projectInfo[projectIndex].imageLink2}
            alt="Project"
            onClick={() => openInNewTab(projectInfo[projectIndex].liveSiteLink)}
          />
        </>
      );
    } else if (projectInfo[projectIndex].contentType === "image" || isMobile) {
      return (
        <>
          <img
            className={projectInfo[projectIndex].className}
            src={projectInfo[projectIndex].imageLink}
            alt="Project"
            onClick={() => openInNewTab(projectInfo[projectIndex].liveSiteLink)}
          />
        </>
      );
    } else {
      return (
        <>
          <video
            src={projectInfo[projectIndex].videoLink}
            type="video/webm"
            onClick={() => openInNewTab(projectInfo[projectIndex].liveSiteLink)}
            className={projectInfo[projectIndex].className}
            autoPlay
            loop
            muted
          ></video>
        </>
      );
    }
  }
  return (
    <div className="Projects">
      <h1 data-aos="slide-left" className="project-title">
        Projects
      </h1>
      <div data-aos="fade-in" className="project-content-section">
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
        <ProjectContent />
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

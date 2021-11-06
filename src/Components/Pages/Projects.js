import React from "react";
import "../../Styles/Projects.css";
function Projects() {
  const openInNewTab = (url) => {
    return window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="Projects">
      <h1 data-aos="slide-left" className="project-title">
        Projects
      </h1>
      <section data-aos="fade-in" className="project-image-section">
        <img
          className="project-image"
          src="/light screenshot.PNG"
          alt="github logo"
          onClick={() =>
            openInNewTab("https://bostonrohan.github.io/Calculator/")
          }
        />
        <img
          className="project-image"
          src="/dark screenshot.PNG"
          alt="github logo"
          onClick={() =>
            openInNewTab("https://bostonrohan.github.io/Calculator/")
          }
        />
      </section>
      <section className="arrows">
        <i className="bi-arrow-right-circle-fill arrow-right"></i>
        <i className="bi-arrow-left-circle-fill arrow-left"></i>
      </section>
      <section data-aos="fade-in" className="project-description">
        <p>
          Project completed following the FreeCodeCamp curriculum. The project
          evaluates equations on an iPhone similar calculator. The project also
          contains light-dark functionality, and mobile responsiveness.
        </p>
      </section>
      <section data-aos="fade-in" className="tech-stack-icons">
        <i className="devicon-react-original"></i>
        <i className="devicon-css3-plain"></i>
        <i className="devicon-html5-plain"></i>
      </section>
      <i
        className="bi-github github-logo"
        onClick={() =>
          openInNewTab("https://github.com/BostonRohan/Calculator")
        }
      ></i>
    </div>
  );
}
export default Projects;

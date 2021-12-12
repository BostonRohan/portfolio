import { React } from "react";
import { useLocation } from "react-router-dom";
import { projectInfo } from "../../Projects/projectInfo";
import { openInNewTab } from "../../../Utils/openTab";
import "./styles.css";
function Project() {
  let index = 0;
  let location = useLocation();
  let currentProject = location.pathname.split("/")[2];
  switch (currentProject) {
    case "Calculator":
      index = 0;
      break;
    case "Pomodoro":
      index = 1;
      break;
    case "Markdown":
      index = 2;
      break;
    case "Randomquote":
      index = 3;
      break;
    default:
      index = 0;
  }
  return (
    <div className="Project">
      <video
        playsInline
        autoPlay
        loop
        muted
        src={`../${projectInfo[index].videoLink}`}
        className="project-video"
      />
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
      <h1 className="project-description">Description</h1>
      <p>{projectInfo[index].description}</p>
      <section className="bg-gray">
        <h3 className="bg-gray-header">Technologies Used</h3>
        {projectInfo[index].technologies.map((icon, index) => {
          return <i key={index} className={icon} />;
        })}
      </section>
      <h1 className="learned-header">What I've learned</h1>
      <p>{projectInfo[index].learned}</p>
    </div>
  );
}
export default Project;

import { React, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { openInNewTab } from "../../Utils/openTab";
import { projectInfo } from "./projectInfo";
import "./styles.css";

function Projects() {
  const [index, setIndex] = useState(0);
  return (
    <div className="Projects">
      <div className="box-1">
        <Link to={`/projects/${projectInfo[index].id}`}>
          <video
            playsInline
            autoPlay
            loop
            muted
            src={projectInfo[index].videoLink}
          ></video>
        </Link>
        <p>{projectInfo[index].description}</p>
        <section className="project-icons">
          <i
            className="bi bi-github"
            onClick={() => openInNewTab(projectInfo[index].repoLink)}
          ></i>
          <i
            className="bi bi-box-arrow-up-right"
            onClick={() => openInNewTab(projectInfo[index].liveSiteLink)}
          ></i>
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
      <div className="box-2">
        <Link to={`/projects/${projectInfo[index + 1].id}`}>
          <video
            playsInline
            autoPlay
            loop
            muted
            src={projectInfo[index + 1].videoLink}
          ></video>
        </Link>
        <section className="project-icons">
          <i
            className="bi bi-github"
            onClick={() => openInNewTab(projectInfo[index + 1].repoLink)}
          ></i>
          <i
            className="bi bi-box-arrow-up-right"
            onClick={() => openInNewTab(projectInfo[index + 1].liveSiteLink)}
          ></i>
        </section>
        <p>{projectInfo[index + 1].description}</p>
        <section className="buttons">
          <button
            className="github-repo"
            onClick={() => openInNewTab(projectInfo[index + 1].repoLink)}
          >
            <i className="bi bi-github"></i> Repository
          </button>
          <button
            className="live-site"
            onClick={() => openInNewTab(projectInfo[index + 1].liveSiteLink)}
          >
            <i className="bi bi-box-arrow-up-right"></i> Live Site
          </button>
        </section>
      </div>
      <section className="view-more">
        <motion.h3
          whileHover={{ scale: 1.2, cursor: "pointer" }}
          onClick={() => {
            if (index === 2) setIndex(0);
            else setIndex(index + 2);
          }}
        >
          View {index === 2 ? "Previous" : "More"}
        </motion.h3>
      </section>
    </div>
  );
}
export default Projects;

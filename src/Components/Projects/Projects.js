import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { openInNewTab } from "../../Utils/openTab";
import { projectInfo } from "./projectInfo";
import "./styles.css";

function Projects() {
  const [index, setIndex] = useState(0);
  const { inView, ref } = useInView();
  const buttonAnimation = useAnimation();
  useEffect(() => {
    if (inView) {
      buttonAnimation.start({
        opacity: 1,
        transition: {
          easeIn: 2,
          duration: 2,
        },
      });
    } else {
      buttonAnimation.start({
        opacity: 0,
      });
    }
  }, [inView, buttonAnimation]);
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
        <motion.section animate={buttonAnimation} className="buttons">
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
        </motion.section>
      </div>
      <div className="box-2" ref={ref}>
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
        <motion.section animate={buttonAnimation} className="buttons">
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
        </motion.section>
      </div>
      <section className="view-more">
        <h3
          onClick={() => {
            if (index === 2) setIndex(0);
            else setIndex(index + 2);
          }}
        >
          View {index === 2 ? "Previous" : "More"}
        </h3>
      </section>
    </div>
  );
}
export default Projects;

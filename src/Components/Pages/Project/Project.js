import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { projectInfo } from "../../Projects/projectInfo";
import { openInNewTab } from "../../../Utils/openTab";
import "./styles.css";
function Project() {
  let location = useLocation();
  let checkProject = projectInfo.map(
    (obj) => obj.name === location.pathname.split("/")[2]
  );
  let index = checkProject.indexOf(true);
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "linear" }}
      className="Project"
    >
      <section className="images">
        {projectInfo[index].images.map((src, i) => {
          return <img key={i} src={src} alt={projectInfo[index].name} />;
        })}
      </section>
      <section className="project-icons">
        <i
          className="bi bi-github"
          onClick={() => openInNewTab(projectInfo[index].repo)}
        />
        <i
          className="bi bi-box-arrow-up-right"
          onClick={() => openInNewTab(projectInfo[index].repo)}
        />
      </section>
      <section className="content">
        <h1>Description</h1>
        <p>{projectInfo[index].description}</p>
        <section className="technologies">
          <h2>Technologies Used</h2>
          {projectInfo[index].technologies.map((icon, i) => {
            return <i key={i} className={icon} />;
          })}
        </section>
        <h1>What I've learned</h1>
        <p>{projectInfo[index].learned}</p>
      </section>
    </motion.div>
  );
}
export default Project;

import { data } from "../utils/projects/data";
import styles from "../styles/projects.module.css";
import Image from "next/image";
import { useState } from "react";
import { disableScroll } from "../utils/disableScroll";
import Modal from "../components/project/modal";

function Projects() {
  const [isOpen, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  disableScroll(isOpen);

  const handleClick = (name) => {
    setOpen(true);
    setProjectName(name);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="Projects">
      <section className={styles.cards}>
        <Modal isOpen={isOpen} handleClose={handleClose} name={projectName} />
        {data.map((project, i) => {
          return (
            <div
              key={project.name}
              className="card"
              onClick={() => handleClick(project.name)}
            >
              <Image
                width={700}
                height={420}
                src={project["images"][0]}
                alt={project.name}
              />
              <p>{project.description}</p>
              <section className={styles.icons}>
                <a href={project.repo} target="_blank">
                  <i className="bi bi-github" />
                </a>
                <a href={project.site} target="_blank">
                  <i className="bi bi-box-arrow-up-right" />
                </a>
              </section>
            </div>
          );
        })}
      </section>
      <div className={`gradient ${styles.g1}`}></div>
    </div>
  );
}
export default Projects;

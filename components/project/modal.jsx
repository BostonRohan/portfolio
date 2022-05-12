import { data } from "../../utils/projects/data";
import Image from "next/image";
import styles from "../../styles/project.module.css";
import Modal from "react-modal";

Modal.setAppElement(".Projects");

function Project({ name, isOpen, handleClose }) {
  const index = data.map((obj) => obj.name).indexOf(name);
  return (
    index > -1 && (
      <Modal isOpen={isOpen} onRequestClose={handleClose} className="modal">
        <section className={styles.images}>
          {data[index].images.map((src) => {
            return (
              <a href={data[index].site} target="_blank" key={src}>
                <Image
                  src={src}
                  alt={data[index].name}
                  width={700}
                  height={400}
                  quality={100}
                />
              </a>
            );
          })}
        </section>
        <section className={styles.icons}>
          <a href={data[index].repo} target="_blank">
            <i className="bi bi-github" />
          </a>
          <a href={data[index].site} target="_blank">
            <i className="bi bi-box-arrow-up-right" />
          </a>
        </section>
        <section className={styles.content}>
          <h1>Description</h1>
          <p>{data[index].description}</p>
          <section className={styles.technologies}>
            <h2>Technologies</h2>
            {data[index].technologies.map((icon) => {
              return <i key={icon} className={icon} />;
            })}
          </section>
          {data[index].learned && (
            <>
              <h1>What I've learned</h1>
              <p>{data[index].learned}</p>
            </>
          )}
          <h1>Status</h1>
          <p
            className={
              data[index].status === "completed"
                ? styles.completed
                : styles.progress
            }
          >
            {data[index].status}
          </p>
        </section>
      </Modal>
    )
  );
}
export default Project;

import { motion } from "framer-motion";
import styles from "../styles/resume.module.css";

function Resume() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "linear" }}
      className={styles.page}
    >
      <a href="Boston Rohan resume 2022.pdf" download>
        <img src="./resume.png" alt="Resume" />
      </a>
    </motion.div>
  );
}
export default Resume;

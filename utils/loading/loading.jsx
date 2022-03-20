import { motion } from "framer-motion";
import styles from "../../styles/loading.module.css";

function Loading() {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: "-100vh",
        transitionEnd: {
          display: "none",
        },
        transition: { type: "linear", delay: 4, duration: 1.5 },
      }}
      className={`${styles.loading} ${styles.accent}`}
    >
      <section className={`${styles.loading} ${styles.title}`}>
        <h1>Boston Rohan</h1>
        <motion.div
          style={{ width: 0 }}
          animate={{
            width: "85%",
            transitionEnd: {
              display: "none",
            },
            transition: { duration: 4.3 },
          }}
          className={`${styles.title} ${styles.underline}`}
        ></motion.div>
      </section>
      <motion.div
        intitial={{ y: 20 }}
        animate={{
          y: "-100vh",
          transitionEnd: {
            display: "none",
          },
          transition: { type: "linear", delay: 4, duration: 1.5 },
        }}
        className={`${styles.loading} ${styles.background}`}
      ></motion.div>
    </motion.div>
  );
}
export default Loading;

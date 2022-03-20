import React from "react";
import { motion } from "framer-motion";
import { openInNewTab } from "../utils/openTab";
import styles from "../styles/school.module.css";

function School() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "linear" }}
        className={styles.page}
      >
        <section className="right">
          <img
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/presentation/d/1Xo9fY_6-4N1rSjRzCmXuQVb2WDXkoyQgHq-JetfUAfk/edit?usp=sharing"
              )
            }
            src="../School/Exhibitions/1.png"
            alt="Exhibition"
          />
          <p>
            Exhibition at North Bay Met Independent Study Program reviewing my
            work as a student, software developer, and my thoughts on the
            future.
          </p>
        </section>
      </motion.div>
    </>
  );
}
export default School;

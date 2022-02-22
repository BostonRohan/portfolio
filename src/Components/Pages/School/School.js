import React from "react";
import Loading from "../../../Utils/loading/loading";
import { motion } from "framer-motion";
import { openInNewTab } from "../../../Utils/openTab";
import "./styles.css";

function School() {
  return (
    <>
      <Loading />
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "linear" }}
        className="School"
      >
        <section className="project-right">
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

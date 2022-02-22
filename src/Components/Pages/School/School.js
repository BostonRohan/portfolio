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
        <img
          onClick={() =>
            openInNewTab(
              "https://docs.google.com/presentation/d/1Xo9fY_6-4N1rSjRzCmXuQVb2WDXkoyQgHq-JetfUAfk/edit?usp=sharing"
            )
          }
          src="../School/Exhibitions/1.png"
          alt="Google slides"
        />
        <p>First Exhibition</p>
      </motion.div>
    </>
  );
}
export default School;

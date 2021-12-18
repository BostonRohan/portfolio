import React from "react";
import { motion } from "framer-motion";
import "./styles.css";
function Resume() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "linear" }}
      className="Resume"
    >
      <img src="./Boston Rohan Resume.png-1.png" alt="Resume" />
    </motion.div>
  );
}
export default Resume;

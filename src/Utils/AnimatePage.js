import React from "react";
import { motion } from "framer-motion";

function AnimatePage({ children }) {
  const animations = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 100 },
    exit: { opacity: 0, x: -100 },
  };
  return (
    <motion.div
      variants={animations}
      intial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
export default AnimatePage;

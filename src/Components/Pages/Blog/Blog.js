import React from "react";
import { openInNewTab } from "../../../Utils/openTab";
import { motion } from "framer-motion";
import "./styles.css";

function Blogs() {
  const options = ["Life", "Work", "Projects", "Hobbies", "School"];
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "linear" }}
    >
      <section className="select">
        <select name="blogs" id="blogs">
          <option value="none" selected disabled hidden />
          {options.map((option, i) => {
            return (
              <option key={i} value={option}>
                {option}
              </option>
            );
          })}
        </select>
      </section>
      <section>
        <h3>Learning React-Select for my New Project</h3>
        <p>
          Being a new web developer is hard. Having to come up with your own
          projects, working day and night to learn new technologies, the process
          can become stressful. Personally, I am thankful to have positive
          influences in the space that I can rely on for advice. Nevertheless,
          we are all learning, and many of us are in different stages of that
          process....
        </p>
        <p
          className="read-more"
          onClick={() =>
            openInNewTab(
              "https://medium.com/@bostonrohan/learning-react-select-for-my-new-project-d676780e2147"
            )
          }
        >
          read more
        </p>
      </section>
    </motion.div>
  );
}
export default Blogs;

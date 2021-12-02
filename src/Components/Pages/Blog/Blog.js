import React from "react";
import "./styles.css";
import { openInNewTab } from "../../../Utils/openTab";
function Blogs() {
  return (
    <>
      <h1 className="first-blog-title">
        Learning React Select for my new Project
      </h1>
      <section className="first-blog-description">
        <p>
          Being a new web developer is hard. Having to come up with your own
          projects, working day and night to learn new technologies, the process
          can become stressful. Personally, I am thankful to have positive
          influences in the space that I can rely on for advice. Nevertheless,
          we are all learning, and many of us are in different stages of that
          process....
        </p>
        <p
          className="first-blog-readmore"
          onClick={() =>
            openInNewTab(
              "https://medium.com/@bostonrohan/learning-react-select-for-my-new-project-d676780e2147"
            )
          }
        >
          read more
        </p>
      </section>
    </>
  );
}
export default Blogs;

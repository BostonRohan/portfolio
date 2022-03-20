import { useState } from "react";
import Link from "next/link";
import { data } from "../../blogs/data";
import { motion } from "framer-motion";
import styles from "../../styles/blogs.module.css";

function Blogs() {
  const [filtered, setFiltered] = useState(data);
  const options = ["Life", "Work", "Projects", "Hobbies", "School"];
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "linear" }}
      className={styles.page}
    >
      <section className={styles.section}>
        <select
          defaultValue="default"
          name="blogs"
          id="blogs"
          onChange={(e) =>
            setFiltered(data.filter((blog) => blog.type === e.target.value))
          }
        >
          <option value="default" disabled hidden />
          {options.map((option, i) => {
            return (
              <option key={i} value={option}>
                {option}
              </option>
            );
          })}
        </select>
      </section>
      <section className={styles.content}>
        {filtered.map((blog, i) => {
          return (
            <Link
              key={i}
              href={`/blog/${blog.type.toLowerCase()}/${blog.title
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
            >
              <section>
                <h3>{blog.title}</h3>
                <p>{blog.body}</p>
                <hr />
              </section>
            </Link>
          );
        })}
      </section>
    </motion.div>
  );
}
export default Blogs;

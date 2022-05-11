import { useState } from "react";
import Link from "next/link";
import { data } from "../../blogs/data";
import { motion } from "framer-motion";
import Header from "../../components/blog/header";
import styles from "../../styles/blogs.module.css";

function Blogs() {
  const featured = data.filter(
    (blog) => blog.title === "Learning React Select"
  )[0];
  const blogs = data.filter((blog) => blog.title !== featured.title);
  return (
    <div className={styles.page}>
      <Link
        href={`/blog/${featured.type.toLowerCase()}/${featured.title
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
      >
        <section className={styles.featured}>
          <Header title={featured.title} date={featured.date} />
          <img src="/blogs/react-select.jpg" alt="react select" />
          <p className={styles.body}>{featured.body}</p>
        </section>
      </Link>
      <section className={styles.blogs}>
        {blogs.map((blog) => {
          return (
            <Link
              key={blog.title}
              href={`/blog/${blog.type.toLowerCase()}/${blog.title
                .replace(/\s+/g, "-")
                .toLowerCase()}`}
            >
              <div>
                <Header title={blog.title} date={blog.date} />
                <p className={styles.body}>{blog.body}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
export default Blogs;

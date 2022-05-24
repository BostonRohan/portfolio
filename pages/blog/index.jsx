import Link from "next/link";
import { data } from "../../blogs/data";
import Header from "../../components/blog/header";
import styles from "../../styles/blogs.module.css";
import Image from "next/image";

function Blogs() {
  const featured = data.filter(
    (blog) => blog.title === "Learning React Select"
  )[0];
  const blogs = data.filter((blog) => blog.title !== featured.title);
  return (
    <div className={styles.page}>
      <Link href={`/blog/${featured.title.replace(/\s+/g, "-").toLowerCase()}`}>
        <section className={styles.featured}>
          <Header title={featured.title} date={featured.date} />
          <Image
            width={625}
            height={400}
            src="/blogs/react-select.jpg"
            alt="react select"
          />
          <p className={styles.body}>{featured.body}</p>
        </section>
      </Link>
      <section className={styles.blogs}>
        {blogs.map((blog) => {
          return (
            <Link
              key={blog.title}
              href={`/blog/${blog.title.replace(/\s+/g, "-").toLowerCase()}`}
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

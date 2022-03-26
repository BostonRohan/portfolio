import Image from "next/image";
import styles from "../styles/about.module.css";

function About() {
  return (
    <div className="About">
      <h1 className={styles.title}>Who is Boston Rohan?</h1>
      <article className={styles.article}>
        <Image
          className={styles.img}
          src="/full-body.jpg"
          alt="Boston Rohan"
          width={1000}
          height={650}
          quality={100}
        />
        <p>
          Hey! I'm Boston, a self-taught web developer. I started learn how to
          code during qurantine because I was in search of controllable
          problems. So many things during that time, and even now, are out of
          our control. Coding was my outlet to create, and problem solve. Being
          a self-taught developer is difficult, and I am thankful to have had
          various mentors along the way. I hope to take the knowledge that I've
          gained and apply it further to benefit myself and others.
        </p>
      </article>
    </div>
  );
}
export default About;

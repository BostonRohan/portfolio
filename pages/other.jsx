import styles from "../styles/other.module.css";
import Image from "next/image";

function Other() {
  return (
    <>
      <div className={styles.content}>
        <section className={styles.resume}>
          <a href="resume.pdf" download target="_blank">
            <Image
              src="/resume.png"
              alt="Boston Rohan Resume"
              width={400}
              height={500}
              quality={100}
            />
          </a>
        </section>
        <section className={styles.archives}>
          {[...Array(3)].map((x, i) => {
            return (
              <a
                href={`https://bostonrohanv${i + 1}.netlify.app`}
                target="_blank"
                key={i}
              >
                <Image
                  src={`/projects/website/v${i + 1}/home.png`}
                  width={500}
                  height={250}
                  layout="fixed"
                  alt={`v${i + 1} archive`}
                />
              </a>
            );
          })}
        </section>
      </div>
      <section className={styles.school}>
        {[...Array(2)].map((x, i) => {
          return (
            <a
              href={
                i === 0
                  ? "https://docs.google.com/presentation/d/1Xo9fY_6-4N1rSjRzCmXuQVb2WDXkoyQgHq-JetfUAfk/edit?usp=sharing"
                  : "https://docs.google.com/presentation/d/1tKNinQpuJxic-msdFqtnwDwcO7SsVRc6sshDGmCguu4/edit?usp=sharing"
              }
              target="_blank"
              key={i}
            >
              <Image
                src={`/school/${i + 1}.png`}
                width={375}
                height={200}
                layout="fixed"
                alt={`exhibition ${i + 1}`}
              />
            </a>
          );
        })}
      </section>
    </>
  );
}

export default Other;

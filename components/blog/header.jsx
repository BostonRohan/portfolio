import styles from "../../styles/blogs.module.css";
import { useRouter } from "next/router";

function Header({ title, date }) {
  const router = useRouter();
  const { pathname } = router;
  return (
    <header className={styles.header}>
      <h2 className={pathname !== "/blog" ? styles.title : undefined}>
        {title}
      </h2>
      <p>{date}</p>
    </header>
  );
}
export default Header;

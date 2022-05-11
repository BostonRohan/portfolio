import { useRouter } from "next/router";
import { useState } from "react";
import { scroll as scrollTo } from "../../utils/scroll";
import { animateScroll as scroll } from "react-scroll";
import Toggle from "./toggle/toggle";
import styles from "../../styles/nav.module.css";
import Image from "next/image";
import Hamburger from "hamburger-react";
import { disableScroll } from "../../utils/disableScroll";

function Nav() {
  const nav = ["Projects", "Blog", "Contact", "Other"];
  const router = useRouter();
  const [isOpen, setOpen] = useState(false);
  const isHome = router.pathname === "/";

  const handleClick = (page) => {
    //other and contact views in progress
    if (page === "Other" || page === "Contact") {
      setOpen(false);
      return;
    } else if (!isHome && page === "Projects") {
      router.push("/");
      setTimeout(() => scrollTo(page), 500);
    } else if (isHome && page === "Projects") {
      scrollTo(page);
    } else router.push(`/${page.toLowerCase()}`);
    setOpen(false);
  };

  disableScroll(isOpen);

  return (
    <div className={isOpen ? styles.nav_active : styles.nav}>
      {!isOpen && (
        <span className={styles.border}>
          <Image
            src="/boston-headshot.jpg"
            width="50px"
            height="50px"
            alt="Boston Rohan"
            className={styles.image}
            quality="100"
            onClick={() => scroll.scrollToTop()}
            priority
          />
        </span>
      )}
      <section className={isOpen ? styles.link_active : styles.link}>
        {nav.map((page) => {
          if (page === "Contact") {
            return (
              <a
                key={page}
                href="mailto:bostonrohan@gmail.com"
                onClick={() => handleClick(page)}
              >
                <h3>{page}</h3>
              </a>
            );
          } else
            return (
              <h3 key={page} onClick={() => handleClick(page)}>
                {page}
              </h3>
            );
        })}
      </section>
      {!isOpen && <Toggle />}
      <Hamburger toggled={isOpen} toggle={setOpen} size={35} />
    </div>
  );
}
export default Nav;

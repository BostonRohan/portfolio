import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { scroll as scrollTo } from "../../utils/scroll";
import { animateScroll as scroll } from "react-scroll";
import Toggle from "./toggle/toggle";
import styles from "../../styles/nav.module.css";
import Hamburger from "hamburger-react";
import { disableScroll } from "../../utils/disableScroll";

function Nav() {
  const [isOpen, setOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const nav = ["Projects", "Blog", "Contact", "Other"];
  const router = useRouter();
  const isHome = router.pathname === "/";
  const windowIsDefined = typeof window !== "undefined";

  const handleClick = (page) => {
    //other and contact views in progress
    if (page === "Contact") {
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

  const controlNav = () => {
    if (windowIsDefined) {
      if (window.scrollY > lastScrollY) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (windowIsDefined) {
      window.addEventListener("scroll", controlNav);
    }

    return () => {
      window.removeEventListener("scroll", controlNav);
    };
  }, [lastScrollY]);

  return (
    <>
      <h3 className={styles.logo} onClick={() => scroll.scrollToTop()}>
        Boss
      </h3>
      <nav
        className={
          isOpen ? styles.nav_active : show ? styles.nav : styles.hidden
        }
      >
        {!isOpen && <Toggle />}
        <Hamburger toggled={isOpen} toggle={setOpen} size={35} />
        <section className={isOpen ? styles.link_active : styles.link}>
          {nav.map((page) => {
            if (page === "Contact") {
              return (
                <a
                  key={page}
                  href="mailto:bostonrohan@gmail.com"
                  onClick={() => handleClick(page)}
                >
                  <h3 className="link">{page}</h3>
                </a>
              );
            } else
              return (
                <h3
                  key={page}
                  className="link"
                  onClick={() => handleClick(page)}
                >
                  {page}
                </h3>
              );
          })}
        </section>
      </nav>
    </>
  );
}
export default Nav;

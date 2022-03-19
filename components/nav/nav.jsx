import { motion } from "framer-motion";
import { Turn as Hamburger } from "hamburger-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { scroll } from "../../utils/scroll";
import Profile from "./profile";
import Toggle from "./toggle/toggle";
import styles from "../../styles/nav.module.css";

function Nav() {
  const [isOpen, setOpen] = useState(false);
  const [isOtherOpen, setOtherOpen] = useState(false);
  const nav = ["About", "Projects", "Contact"];
  const other = ["Blog", "School", "Resume", "Hobbies"];
  const router = useRouter();
  let home = router.pathname === "/";

  const handleClick = (element) => {
    setOpen(false);
    setTimeout(() => scroll(element), 200);
  };

  //disable scroll wheel
  useEffect(() => {
    if (isOpen) {
      document.body.scroll = "no";
      document.body.style.overflow = "hidden";
      document.height = window.innerHeight;
    } else {
      document.body.scroll = "yes";
      document.body.style.overflow = "auto";
      document.height = "auto";
    }
  }, [isOpen]);

  return (
    <div>
      <Profile home={home} />
      <Toggle />
      {isOpen ? (
        <div className={styles.active}>
          <Hamburger
            toggled={isOpen}
            toggle={setOpen}
            size={40}
            hideOutline={false}
          />
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "linear" }}
            className={styles.elements}
          >
            {nav.map((element, i) => {
              if (home)
                return (
                  <h1
                    key={i}
                    className={`${styles.element} link`}
                    onClick={() => handleClick(element)}
                  >
                    {element}
                  </h1>
                );
              else
                return (
                  <Link key={i} href="/" onClick={() => handleClick(element)}>
                    <h1 className={`${styles.element} link`}>{element}</h1>
                  </Link>
                );
            })}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "linear" }}
            className={styles.otherActive}
          >
            {isOtherOpen ? (
              <>
                {other.map((element, i) => {
                  return (
                    <Link
                      key={i}
                      href={`/${element.toLowerCase()}`}
                      onClick={() => setOpen(false)}
                    >
                      <h3 className={`${styles.elementOther} link`}>
                        {element}
                      </h3>
                    </Link>
                  );
                })}
              </>
            ) : (
              <h1
                className={`${styles.element} link`}
                onClick={() => setOtherOpen(true)}
              >
                Other
              </h1>
            )}
          </motion.div>
        </div>
      ) : (
        <div className={styles.nav}>
          <Hamburger
            duration={0.8}
            toggled={isOpen}
            toggle={setOpen}
            size={40}
            hideOutline={false}
          />
        </div>
      )}
    </div>
  );
}
export default Nav;

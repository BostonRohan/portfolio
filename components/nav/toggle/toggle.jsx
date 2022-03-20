import { useState, useEffect } from "react";
import { setTheme } from "./themes";
import styles from "../../../styles/toggle.module.css";

function Toggle() {
  const [toggle, setToggle] = useState("dark");
  let theme =
    typeof window !== "undefined"
      ? localStorage.getItem("theme")
      : "theme-dark";
  const handleClick = () => {
    //If the user clicks the toggle and it is currently dark, change it to light
    if (theme === "theme-dark") {
      setTheme("theme-light");
      setToggle("light");
    }
    //Otherwise, the default will be dark
    else {
      setTheme("theme-dark");
      setToggle("dark");
    }
  };
  //Will change the value of toggle if the theme changes
  useEffect(() => {
    if (theme === "theme-dark") setToggle("dark");
    else if (theme === "theme-light") setToggle("light");
  }, [theme]);
  return (
    <div className={styles.toggle}>
      {toggle === "light" ? (
        <i className="bi bi-brightness-high-fill" onClick={handleClick}></i>
      ) : (
        <i className="bi bi-moon-fill" onClick={handleClick}></i>
      )}
    </div>
  );
}
export default Toggle;

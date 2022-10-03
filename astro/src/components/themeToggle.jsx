import { useEffect, useState } from "preact/hooks";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme"));

  const isThemeLight = theme === "light";

  const handleClick = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={handleClick}
      className="ml-auto"
      aria-label="light/dark toggle"
    >
      <img
        width="16px"
        height="16px"
        src={isThemeLight ? "/icons/sun.svg" : "/icons/moon.svg"}
        alt={isThemeLight ? "sun" : "moon"}
      />
    </button>
  );
}

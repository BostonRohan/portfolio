import { theme as themeStore } from "../../store";
import { useEffect, useState } from "react";

export default function Nav({
  pages,
  currentPath,
}: {
  pages: string[];
  currentPath: string;
}) {
  const handleClick = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      themeStore.set("dark");
      localStorage.removeItem("theme");
      document.documentElement.classList.add("dark");
    } else {
      themeStore.set("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  const [scrollPosition, setPosition] = useState<number>(0);

  useEffect(() => {
    function updatePosition() {
      setPosition(window.scrollY);
    }

    window.addEventListener("scroll", updatePosition);
    updatePosition();

    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  const isHome = currentPath === "/";

  return (
    <nav
      className={`m-auto w-full z-20 rounded-md px-4 mb-10 sticky top-4 transition ${scrollPosition < 1 ? "bg-transparent" : "bg-slate-200/50 dark:bg-zinc-950/40 backdrop-blur-2xl"}`}
      id="nav"
    >
      <div className="flex items-center justify-between mx-auto">
        <div className="flex justify-center gap-4 items-center w-full h-14 mx-auto sm:text-left text-center">
          {pages.map((page, i) => {
            const href = page === "Home" ? "/" : `#${page.toLowerCase()}`;
            return (
              <a
                key={`${page}-${i}`}
                href={href}
                className="rounded-lg font-medium hover:dark:text-neutral-300 hover:text-neutral-600 dark:text-neutral-50 sm:text-base text-sm"
              >
                {page}
              </a>
            );
          })}

          <div className="ml-auto flex flex-row-reverse items-center">
            <button
              className="relative w-8 h-8 flex items-center justify-center"
              aria-label="Light/Dark Mode Button Toggle"
              onClick={handleClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#d29922"
                className="bi bi-moon-fill dark:hidden"
                viewBox="0 0 16 16"
              >
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path>
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#fde047"
                className="bi bi-brightness-high-fill hidden dark:block"
                viewBox="0 0 16 16"
              >
                <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path>
              </svg>
            </button>
            <a
              href="#contact"
              id="name"
              type="button"
              className={`mr-4 sm:border sm:no-underline underline rounded-2xl transition sm:p-1.5 sm:text-sm text-xs flex items-center justify-center dark:hover:bg-neutral-400/15 hover:bg-slate-200 ${isHome && scrollPosition > 320 && scrollPosition < 1000 ? "opacity-100" : "opacity-0"}`}
            >
              Let's connect
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

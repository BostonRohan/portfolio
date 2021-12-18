//Function that sets theme/color-scheme
export const setTheme = (themeName) => {
  localStorage.setItem("theme", themeName);
  document.documentElement.className = themeName;
};

export const keepTheme = () => {
  let theme = localStorage.getItem("theme");
  //If the theme is light, set the theme as light
  if (theme === "theme-light") setTheme("theme-light");
  //Or if the theme is dark, set the theme to dark
  else if (theme === "theme-dark") setTheme("theme-dark");
  //Otherwise, the default theme will be light
  else setTheme("theme-light");
};

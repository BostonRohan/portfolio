import "../styles/globals.css";
import Nav from "../components/nav/nav";
import { useEffect } from "react";
import { keepTheme } from "../components/nav/toggle/themes";
import "bootstrap-icons/font/bootstrap-icons.css";

function App({ Component, pageProps }) {
  //light-dark theme
  useEffect(() => {
    keepTheme();
  });

  return (
    <>
      <Nav />
      <Component {...pageProps} />
    </>
  );
}

export default App;

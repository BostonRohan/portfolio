import "../styles/globals.css";
import Nav from "../components/nav/nav";
import { useEffect } from "react";
import { keepTheme } from "../components/nav/toggle/themes";
import "bootstrap-icons/font/bootstrap-icons.css";
import Head from "next/head";

function App({ Component, pageProps }) {
  //light-dark theme
  useEffect(() => {
    keepTheme();
  });

  return (
    <>
      <Head>
        <title>Boston Rohan</title>
      </Head>
      <Nav />
      <Component {...pageProps} />
    </>
  );
}

export default App;

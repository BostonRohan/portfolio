import "bootstrap-icons/font/bootstrap-icons.css";
import Head from "next/head";
import { useEffect } from "react";
import Nav from "../components/nav/nav";
import { keepTheme } from "../components/nav/toggle/themes";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  //light-dark theme
  useEffect(() => {
    keepTheme();
  });

  return (
    <>
      <Head>
        <title>Boston Rohan</title>
        <meta name="robots" content="follow, index" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Boston Rohan" />
        <meta
          name="keywords"
          content="Web Development, JavaScript, React, Next, Express, Node, Boston, Rohan, BostonRohan, Boston Rohan, Blog"
        />
        <meta name="author" content="Boston Rohan" />
        <meta name="theme-color" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Nav />
      <Component {...pageProps} />
    </>
  );
}

export default App;

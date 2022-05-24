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
        <meta name="description" content="Boston Rohan website" />
        <meta property="og:title" content="Boston Rohan" />
        <meta property="og:description" content="Boston Rohan website" />
        <meta property="og:url" content="https://bostonrohan.com/" />
        <meta property="og:type" content="website" />
        <meta
          name="keywords"
          content="Web Development, JavaScript, React, Next, Express, Node, Boston, Rohan, BostonRohan, Boston Rohan"
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

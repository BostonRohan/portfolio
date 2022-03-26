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
        <meta name="description" content="Boston Rohan Website Portfolio" />
        <meta
          name="keywords"
          content="Web Development, JavaScript, React, Next, Express, Node, Boston, Rohan"
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

// import "../styles/globals.css";
import Nav from "../components/nav/nav";

function App({ Component, pageProps }) {
  return (
    <>
      <Nav />
      <Component {...pageProps} />
    </>
  );
}

export default App;

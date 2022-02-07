import React from "react";
import Loading from "../Utils/loading/loading";
import Home from "./Home/Home";
import About from "./About/About";
import Projects from "./Projects/Projects";
import Contact from "./Contact/Contact";
import Footer from "./Footer/Footer";

function Main() {
  return (
    <main>
      <Loading />
      <Home />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
export default Main;

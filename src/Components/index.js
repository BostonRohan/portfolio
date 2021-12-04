import React from "react";
import Home from "./Home/Home";
import About from "./About/About";
import Reccomendations from "./Reccomendations/Reccomendations";
import Projects from "./Projects/Projects";
import Contact from "./Contact/Contact";

function Main() {
  return (
    <main>
      <Home />
      <Reccomendations />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}
export default Main;

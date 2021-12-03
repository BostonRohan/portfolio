import React from "react";
import Nav from "./Nav/Nav";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Reccomendations from "./Pages/Reccomendations/Reccomendations";
import Projects from "./Pages/Projects/Projects";
import Contact from "./Pages/Contact/Contact";

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

import React from "react";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Reccomendations from "./Pages/Reccomendations/Reccomendations";
import Projects from "./Pages/Projects/Projects";
import Contact from "./Pages/Contact/Contact";

function Main() {
  return (
    <div className="page">
      <Home />
      <Reccomendations />
      <About />
      <Projects />
      <Contact />
    </div>
  );
}
export default Main;

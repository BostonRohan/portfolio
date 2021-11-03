import { React } from "react";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Reccomendations from "./Pages/Reccomendations";
import Projects from "./Pages/Projects";
import Contact from "./Pages/Contact";

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

import { React, useEffect } from "react";
import Home from "./Pages/Home/Home";
import About from "./Pages/About/About";
import Reccomendations from "./Pages/Reccomendations/Reccomendations";
import Projects from "./Pages/Projects/Projects";
import Contact from "./Pages/Contact/Contact";
import Aos from "aos";
import "aos/dist/aos.css";

function Main() {
  useEffect(() => {
    Aos.init({ duration: 3000 });
  }, []);
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

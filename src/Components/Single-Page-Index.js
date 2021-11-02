import { React } from "react";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Reccomendations from "./Pages/Reccomendations";
function Main() {
  return (
    <div className="page">
      <Home />
      <Reccomendations />
      <About />
    </div>
  );
}
export default Main;

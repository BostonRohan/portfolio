import { React } from "react";
import Home from "./Home";
import About from "./About";
import Reccomendations from "./Reccomendations";
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

import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Main from "./Components/SPA Index";
import Navbar from "./Components/Nav/Nav";
import NavScreen from "./Components/Pages/Navscreen";
import Other from "./Components/Pages/Other";
import About from "./Components/Pages/About";
import Projects from "./Components/Pages/Projects";
import Contact from "./Components/Pages/Contact";
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Main}></Route>
          <Route path="/about" exact component={About}></Route>
          <Route path="/projects" exact component={Projects}></Route>
          <Route path="/contact" exact component={Contact}></Route>
          <Route path="/other" exact component={Other}></Route>
          <Route path="/blog"></Route>
          <Route path="/school"></Route>
          <Route path="/resume"></Route>
          <Route path="/nav" exact component={NavScreen}></Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;

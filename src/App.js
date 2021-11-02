import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Main from "./Components/Single-Page-Index";
import Navbar from "./Components/Nav/Nav";
import NavScreen from "./Components/Pages/Navscreen";
import Other from "./Components/Pages/Other";
import About from "./Components/Pages/About";
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Main}></Route>
          <Route path="/about" exact component={About}></Route>
          <Route path="/projects"></Route>
          <Route path="/contact"></Route>
          <Route path="/other" component={Other}></Route>
          <Route path="/blog"></Route>
          <Route path="/school"></Route>
          <Route path="/resume"></Route>
          <Route path="/nav" component={NavScreen}></Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;

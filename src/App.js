import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Components/Pages/Home";
import Navbar from "./Components/Nav";
import NavScreen from "./Components/Pages/Navscreen";
import Other from "./Components/Pages/Other";
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home}></Route>
          <Route path="/about"></Route>
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

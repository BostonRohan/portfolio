import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Components/Pages/Home";
import NavScreen from "./Components/Pages/Navscreen";
function App() {
  return (
    <>
      <Router>
        <Switch>
          <Route path="/" exact component={Home}></Route>
          <Route path="/about"></Route>
          <Route path="/projects"></Route>
          <Route path="/contact"></Route>
          <Route path="/other"></Route>
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

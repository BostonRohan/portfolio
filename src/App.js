import { React } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Main from "./Components/index";
import Nav from "./Components/Nav/Nav";
import Resume from "./Components/Pages/Resume/Resume";
import Blogs from "./Components/Pages/Blog/Blog";
import "./Universal.css";
import "bootstrap-icons/font/bootstrap-icons.css";
function App() {
  return (
    <>
      <Router>
        <Nav />
        <Switch>
          <Route path="/" exact component={Main}></Route>
          <Route path="/blog" exact component={Blogs}></Route>
          <Route path="/school"></Route>
          <Route path="/resume" exact component={Resume}></Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;

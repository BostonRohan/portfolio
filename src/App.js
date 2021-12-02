import { React } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Main from "./Components/Main";
import Nav from "./Components/Navmenu/Nav";
import NavScreen from "./Components/Pages/Nav/Nav";
import Other from "./Components/Pages/Nav/Other";
import About from "./Components/Pages/About/About";
import Projects from "./Components/Pages/Projects/Projects";
import Contact from "./Components/Pages/Contact/Contact";
import Resume from "./Components/Pages/Resume/Resume";
import Blogs from "./Components/Pages/Blog/Blog";
import "./Universal.css";
function App() {
  return (
    <>
      <Router>
        <Nav />
        <Switch>
          <Route path="/" exact component={Main}></Route>
          <Route path="/about" exact component={About}></Route>
          <Route path="/projects" exact component={Projects}></Route>
          <Route path="/contact" exact component={Contact}></Route>
          <Route path="/other" exact component={Other}></Route>
          <Route path="/blog" exact component={Blogs}></Route>
          <Route path="/school"></Route>
          <Route path="/resume" exact component={Resume}></Route>
          <Route path="/nav" exact component={NavScreen}></Route>
        </Switch>
      </Router>
    </>
  );
}

export default App;

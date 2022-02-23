import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { keepTheme } from "./Components/Nav/Toggle/themes";
import Main from "./Components/index";
import Nav from "./Components/Nav/Nav";
import Resume from "./Components/Pages/Resume/Resume";
import Blogs from "./Components/Pages/Blog/Blog";
import School from "./Components/Pages/School/School";
import Project from "./Components/Pages/Project/Project";
import ReactSelect from "./Components/Pages/Blog/Blogs/Projects/react-select";
import Hobbies from "./Components/Pages/Hobbies/Hobbies";
import "./Universal.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  //Light-dark theme
  useEffect(() => {
    keepTheme();
  }, []);
  return (
    <>
      <Router>
        <Nav />
        <Switch>
          <Route path="/" exact component={Main} />
          <Route path="/blog" exact component={Blogs} />
          <Route
            path="/blog/projects/learning-react-select"
            exact
            component={ReactSelect}
          />
          <Route path="/school" exact component={School} />
          <Route path="/projects/:name" exact component={Project} />
          <Route path="/resume" exact component={Resume} />
          <Route path="/hobbies" exact component={Hobbies} />
        </Switch>
      </Router>
    </>
  );
}

export default App;

import React from "react";
import "../../Styles/Home.css";
import Navbar from "../Navbar";
function Home() {
  return (
    <>
      <Navbar />
      <div className="line"></div>
      <h1 className="welcome">Welcome</h1>
    </>
  );
}
export default Home;

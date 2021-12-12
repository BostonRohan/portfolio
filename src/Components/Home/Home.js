import React from "react";
function Home() {
  const styles = {
    width: "100%",
    height: "100vh",
    backgroundImage: 'url("../../Full body photo.jpg")',
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
  return <div className="Home" style={styles}></div>;
}
export default Home;

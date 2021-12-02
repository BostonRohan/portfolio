// import { React, useState } from "react";
// import { useHistory, Link } from "react-router-dom";
// import { Link as Scroll } from "react-scroll";
// import "./styles.css";
// export function NavMenu() {
//   const [toggleNavIcon, setToggleNavIcon] = useState(false);
//   const handleClick = () => {
//     setToggleNavIcon(!toggleNavIcon);
//   };
//   console.log(toggleNavIcon);
//   return (
//     <>
//       <Scroll
//         className="logo"
//         activeClass="active"
//         to="Home"
//         spy={true}
//         smooth={true}
//       >
//         Boston
//       </Scroll>
//       <div className="nav-icon-container" onClick={handleClick}>
//         <div className={toggleNavIcon ? "change" : "bar1"}></div>
//         <div className={toggleNavIcon ? "change" : "bar2"}></div>
//         <div className={toggleNavIcon ? "change" : "bar3"}></div>
//       </div>
//     </>
//   );
// }
// export function NavOnClick() {
//   let history = useHistory();
//   return (
//     <div className="nav">
//       <Link className="logo" to="/">
//         Boston
//       </Link>
//       <i className="bi-x-lg x" onClick={() => history.goBack()}></i>
//     </div>
//   );
// }

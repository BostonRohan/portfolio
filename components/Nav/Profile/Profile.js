import { Link } from "react-router-dom";
import { Link as Scroll } from "react-scroll";
import "./styles.css";

function Profile({ isHome }) {
  return (
    <section className="profile">
      {isHome ? (
        <Scroll smooth={true} to="Home">
          <h3>Boston Rohan</h3>
        </Scroll>
      ) : (
        <h3>
          <Link to="/">Boston Rohan</Link>
        </h3>
      )}
      <img src="./Headshots/headshot.jpg" alt="Profile Icon" />
    </section>
  );
}
export default Profile;

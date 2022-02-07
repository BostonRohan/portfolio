import { Link } from "react-router-dom";
import "./styles.css";

function Profile({ isHome }) {
  return (
    <section className="profile">
      {isHome ? (
        <h3>Boston Rohan</h3>
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

import Link from "next/link";
import { Link as Scroll } from "react-scroll";

function Profile({ isHome }) {
  return (
    <section className="profile">
      {isHome ? (
        <Scroll smooth={true} to="Home">
          <h3>Boston Rohan</h3>
        </Scroll>
      ) : (
        <h3>
          <Link href="/">Boston Rohan</Link>
        </h3>
      )}
      <img src="./Headshots/headshot.jpg" alt="Profile Icon" />
    </section>
  );
}
export default Profile;

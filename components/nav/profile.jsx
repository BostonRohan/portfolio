import { useRouter } from "next/router";
import styles from "../../styles/profile.module.css";
import { scroll } from "../../utils/scroll";

function Profile({ home }) {
  const router = useRouter();

  const handleClick = () => {
    if (home) scroll("landing");
    else router.push("/");
  };

  return (
    <section className={styles.profile}>
      <h3 onClick={handleClick}>Boston Rohan</h3>
      <img src="../Headshots/headshot.jpg" alt="Profile Icon" />
    </section>
  );
}
export default Profile;

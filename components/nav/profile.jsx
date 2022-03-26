import { useRouter } from "next/router";
import styles from "../../styles/profile.module.css";
import { scroll } from "../../utils/scroll";
import Image from "next/image";

function Profile({ home }) {
  const router = useRouter();

  const handleClick = () => {
    if (home) scroll("landing");
    else router.push("/");
  };

  return (
    <section className={styles.profile}>
      <h3 onClick={handleClick}>Boston Rohan</h3>
      <Image
        className={styles.image}
        width={60}
        height={60}
        src="/Headshots/headshot.jpg"
        alt="Boston Rohan"
        quality={100}
      />
    </section>
  );
}
export default Profile;

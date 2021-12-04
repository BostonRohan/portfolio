import React from "react";
import "./styles.css";
import { Link as Scroll } from "react-scroll";
import { openInNewTab } from "../../Utils/openTab";
function About() {
  return (
    <div className="About">
      <section className="about-title-section">
        <h1 className="about-title">About</h1>
      </section>
      <article className="about-me">
        <img
          className="personal-photo"
          src="./Headshots/Pesonal Headshot.jpg"
          alt="Profile Icon"
        />
        <section className="about-buttons">
          <button
            className="instagram-button"
            onClick={() => openInNewTab("https://www.instagram.com/bosston.r/")}
          >
            <i className="bi-instagram instagram-icon"></i>Instagram
          </button>
        </section>
        <p>
          Hey! I'm Boston a junior web developer. I love to create modern and
          effective web applications for people to enjoy. I am a fast learner,
          and adapt quickly to fast paced environments. I enjoy collaboration,
          and will do the best I can to bring the best out of my teammates.
        </p>
        <p>
          I have been learning the <b>MERN</b> stack with MongoDB, Express,
          React and Node.
        </p>
        <p>
          I am certain that web development is my calling to serve others with
          clean, good-looking, and efficient web applications. By turning my
          hobby into a career I hope to serve myself, my family, and my
          community.
        </p>
        <p>
          To contact me, or gain more information{" "}
          <Scroll
            className="click-text"
            activeClass="active"
            spy={true}
            smooth={true}
            to="Contact"
          >
            click here.
          </Scroll>
        </p>
      </article>
    </div>
  );
}
export default About;

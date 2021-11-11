import React from "react";
import "../../Styles/About.css";
import { Link as Scroll } from "react-scroll";
function About() {
  return (
    <div className="About">
      <h1 data-aos="slide-left" className="about-title">
        About Me
      </h1>
      <img
        className="headshot"
        src="/Pesonal Headshot.jpg"
        alt="Profile Icon"
      />
      <section data-aos="fade-in" className="about-text">
        <p>
          Hi, my name is Boston Rohan, I am 17, and an aspiring software
          developer based out of Windsor California. I was born on the east
          coast and spent most of my time there, before moving to California for
          my fathers job. I played basketball throughout high school but stopped
          my junior year admist Covid-19 to puruse software development, and
          work at a groccery store on the side.
        </p>
        <p>
          I strive to support myself and family through software development and
          creating software applications for people to navigate and enjoy. I am
          familiar with HTML, CSS, JavaScript, and React. I hope to be able to
          connect with you in the future!
        </p>
        <p>
          To contact me, or gain more information,{" "}
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
      </section>
    </div>
  );
}
export default About;

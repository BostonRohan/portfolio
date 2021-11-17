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
          I believe my higher purpose is to serve others. I've always loved
          designing logos, and banners for my friends, though when I entered
          High School the passion shifted to sports. Throughout High School, I
          played basketball connecting with people from all walks of life
          invested in their sport. As time passed, I realized that I have to do
          more in support of myself and my family. Starting my job at Raley's I
          was grateful to be able to learn about the retail industry, and help
          serve others in times of need.{" "}
        </p>
        <p>
          Following March 2020s events to the present day, I had a lot of time
          to reflect on myself and my passions. Amidst this time, I was able to
          rekindle my love for designing by designing and coding web
          applications. I started to learn how to code when I was 16 with my
          first language being JavaScript.Throughout my learning process, I
          overcame many hurdles. Learning data structures, variables, data
          types, syntax and more proved very difficult. Balancing school, my own
          coding education, and my job, I've had to overcome many obstacles.
          Even so, with the help of various free classes, websites, and the few
          mentors that I've reached out to in the Web Development space, I've
          been able to learn JavaScript, HTML, CSS, React, and Git/Github.{" "}
        </p>
        <p>
          I am also in the process of learning Express, MongoDB, and NodeJS. I
          am certain that Web Development is my calling to serve others with
          clean, good-looking, and efficient web applications. By turning my
          hobby into a career I hope to serve myself, my family, and my
          community.
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

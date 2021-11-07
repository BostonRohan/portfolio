import React from "react";
import "../../Styles/Contact.css";
import Footer from "../Footer";
function Contact() {
  return (
    <>
      <div data-aos="fade-in" className="Contact">
        <h1 data-aos="slide-left" className="contact-title">
          Contact Me
        </h1>
        <form data-aos="slide-right">
          <input type="text" placeholder="Name" />
          <textarea className="contact-description" placeholder="Description" />
          <input className="btn-grad" type="submit" value="Submit" />
        </form>
      </div>
      <Footer />
    </>
  );
}
export default Contact;

import React from "react";
import "../../Styles/Contact.css";
import Footer from "../Footer";
function Contact() {
  return (
    <>
      <div className="Contact">
        <h1 data-aos="slide-left" className="contact-title">
          Contact Me
        </h1>
        <form data-aos="slide-right" method="POST" action="/post-feedback">
          <input
            type="text"
            placeholder="Name"
            minLength="3"
            maxLength="20"
            required
          />
          <textarea
            className="contact-description"
            placeholder="Description"
            maxLength="200"
            required
          />
          <input className="btn-grad" type="submit" value="Submit" />
        </form>
      </div>
      <Footer />
    </>
  );
}
export default Contact;

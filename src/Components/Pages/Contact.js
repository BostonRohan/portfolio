import React from "react";
import "../../Styles/Contact.css";
import Footer from "../Footer";
function Contact() {
  return (
    <div className="Contact">
      <h1 className="contact-title">Contact Me</h1>
      <form>
        <input type="text" placeholder="Name" />
        <textarea className="contact-description" placeholder="Description" />
        <input type="submit" />
      </form>
      <Footer />
    </div>
  );
}
export default Contact;

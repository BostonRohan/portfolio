import { React, useRef } from "react";
import "./styles.css";
import emailjs from "emailjs-com";
function Contact() {
  const form = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        "gmail",
        "gmail_template",
        form.current,
        "user_5JR6xA23fPWuOtTkM2waX"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
    e.target.reset();
  };
  return (
    <div className="Contact">
      <h1>Contact Me</h1>
      <form ref={form} onSubmit={handleSubmit}>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Name"
          minLength="3"
          maxLength="20"
          required
        />
        <input
          name="email"
          type="text"
          placeholder="email"
          minLength="3"
          maxLength="254"
          required
        />
        <textarea
          id="description"
          name="description"
          className="contact-description"
          placeholder="Work with me?"
          maxLength="200"
          required
        />
        <input className="btn-grad" type="submit" value="Submit" />
      </form>
    </div>
  );
}
export default Contact;

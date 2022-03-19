import { React, useRef, useState } from "react";
import "./styles.css";
import emailjs from "emailjs-com";
function Contact() {
  const form = useRef();
  const [error, setError] = useState(null);
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
        (result) => {},
        (error) => {
          setError(error);
        }
      );
    e.target.reset();
  };
  return (
    <div className="Contact">
      <section>
        <img
          width="600"
          height="800"
          src={`https://maps.geoapify.com/v1/staticmap?style=positron-blue&width=600&height=800&center=lonlat:-122.81638,38.547133&zoom=12.4&pitch=33&marker=lonlat:-122.81436621391315,38.54646663084179;color:%2342445a;size:medium&apiKey=${process.env.REACT_APP_SECRET}`}
          alt="map"
        />
        <form ref={form} onSubmit={handleSubmit}>
          <h1>Contact Me</h1>
          {error && (
            <h3 className="error">There was an error, please resubmit.</h3>
          )}
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
      </section>
    </div>
  );
}
export default Contact;

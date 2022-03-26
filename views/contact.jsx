import { useRef } from "react";
import emailjs from "emailjs-com";
import Image from "next/image";
import styles from "../styles/contact.module.css";

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
          if (result.text === "OK")
            alert("Message sent, excited to connect with you soon!");
        },
        (error) => {
          if (error)
            alert(
              "There was an error sending your message, please try again or reach out to me on my various social media accounts linked below. :)"
            );
        }
      );
    e.target.reset();
  };
  return (
    <div className="Contact">
      <section className={styles.section}>
        <img
          className={styles.img}
          src={`https://maps.geoapify.com/v1/staticmap?style=positron-blue&width=600&height=800&center=lonlat:-122.81638,38.547133&zoom=12.4&pitch=33&marker=lonlat:-122.81436621391315,38.54646663084179;color:%2342445a;size:medium&apiKey=52570401004e46e3b33451cd5064fa5e`}
          alt="map"
        />
        <form className={styles.form} ref={form} onSubmit={handleSubmit}>
          <h1 className={styles.h1}>Contact Me</h1>
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
            className={styles.textarea}
            placeholder="Work with me?"
            maxLength="200"
            required
          />
          <input className="button" type="submit" value="Submit" />
        </form>
      </section>
    </div>
  );
}
export default Contact;

import { useRef, useState } from "react";
import emailjs from "emailjs-com";
import styles from "../styles/contact.module.css";

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
      <section className={styles.section}>
        <form className={styles.form} ref={form} onSubmit={handleSubmit}>
          <h1 className={styles.h1}>Contact Me</h1>
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

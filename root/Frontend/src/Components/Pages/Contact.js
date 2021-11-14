import { React, useState } from "react";
import "../../Styles/Contact.css";
import Footer from "../Footer";
function Contact() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    let formData = {
      name: name,
      description: description,
    };
    //Use fetch api
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.onLoad = function () {
      console.log(xhr.responseText);
      if (xhr.responseText === "success") {
        alert("Email sent");
        setName("");
        setDescription("");
      } else {
        alert("Something went wrong!");
      }
    };
    xhr.send(JSON.stringify(formData));
  };
  return (
    <>
      <div className="Contact">
        <h1 data-aos="slide-left" className="contact-title">
          Contact Me
        </h1>
        <form data-aos="slide-right">
          <input
            id="name"
            type="text"
            placeholder="Name"
            minLength="3"
            maxLength="20"
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            id="description"
            className="contact-description"
            placeholder="Description"
            maxLength="200"
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            className="btn-grad"
            type="submit"
            value="Submit"
            onClick={handleSubmit}
          />
        </form>
      </div>
      <Footer />
    </>
  );
}
export default Contact;

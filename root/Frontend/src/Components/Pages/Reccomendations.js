import React from "react";
import "../../Styles/Reccomendations.css";
function Reccomendations() {
  return (
    <div className="Reccomendations">
      <img
        data-aos="fade-left"
        className="photo"
        src="/Anthony Gilmore.jpeg"
        alt="Raleys Logo"
      />
      <section data-aos="fade-in" className="paragraphs">
        <p>Boston,</p>
        <p>
          You were acknowledged by a guest for delivering a great customer
          experience, a real "WOW" moment!
        </p>
        <p className="quote">
          "Boston goes above and beyond in his job. He is always polite and
          looking to help! Many times, he comes up to me to greet me. He makes
          me feel welcome."
        </p>
        <p>
          I want to personally thank you for delivering on our customer promise
          by truly valuing and connecting with our customers in a genuine and
          authentic way. I appreciate you for being an example not only for your
          store team but the entire company. Moments like this and team members
          like you inspire me and others to be proud of our culture of Raley's.
        </p>
        <p>Thank you,</p>
        <p>Anthony M Gilmore District 6 </p>
      </section>
    </div>
  );
}
export default Reccomendations;

import React from "react";
import { openInNewTab } from "../../../Utils/openTab";
import "./styles.css";

function School() {
  return (
    <div className="School">
      <div className="column">
        <div className="card">
          <img
            src="../School/Exhibitions/1.png"
            alt="Google slides"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/presentation/d/1Xo9fY_6-4N1rSjRzCmXuQVb2WDXkoyQgHq-JetfUAfk/edit?usp=sharing"
              )
            }
          />
          <p>First Exhibition</p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img
            src="../School/SRJC/1.png"
            alt="Essay"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/1LDA1C_42M1ECLmWeErVU3RpxLB8HEiDNjuXifRJEyZA/edit?usp=sharing"
              )
            }
          />
          <p>
            <i>Stay Engaged In Your Life</i>
            <br></br>
            SRJC Response
          </p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img
            src="../School/English/1.png"
            alt="Essay"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/12LoaHmAQNHDQgs6sZEEJIEfI3lbupLK8bjah0IMtjq8/edit?usp=sharing"
              )
            }
          />
          <p>
            <i>Pressure Creates Diamonds</i>
            <br></br>Tituba Response
          </p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img
            src="../School/History/1.png"
            alt="Notes"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/10yOTzXQFT5ZSplL5OFiEYSUkhlplvT18B2fTynNymh0/edit?usp=sharing"
              )
            }
          />
          <p>
            Exploring the Constitution
            <br></br>
            History
          </p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img src="" alt="" />
          <p></p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img src="" alt="" />
          <p></p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img src="" alt="" />
          <p></p>
        </div>
      </div>
      <div className="column">
        <div className="card">
          <img src="" alt="" />
          <p></p>
        </div>
      </div>
    </div>
  );
}
export default School;

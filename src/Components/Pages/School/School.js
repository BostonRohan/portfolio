import React from "react";
import Loading from "../../../Utils/loading/loading";
import { motion } from "framer-motion";
import { openInNewTab } from "../../../Utils/openTab";
import "./styles.css";

function School() {
  return (
    <>
      <Loading />
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "linear" }}
        className="School"
      >
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/presentation/d/1Xo9fY_6-4N1rSjRzCmXuQVb2WDXkoyQgHq-JetfUAfk/edit?usp=sharing"
              )
            }
          >
            <img src="../School/Exhibitions/1.png" alt="Google slides" />
            <p>First Exhibition</p>
          </div>
        </div>
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/1LDA1C_42M1ECLmWeErVU3RpxLB8HEiDNjuXifRJEyZA/edit?usp=sharing"
              )
            }
          >
            <img src="../School/SRJC/1.png" alt="Essay" />
            <p>
              <i>Stay Engaged In Your Life</i>
              <br></br>
              SRJC Response
            </p>
          </div>
        </div>
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/12LoaHmAQNHDQgs6sZEEJIEfI3lbupLK8bjah0IMtjq8/edit?usp=sharing"
              )
            }
          >
            <img src="../School/English/1.png" alt="Essay" />
            <p>
              <i>Pressure Creates Diamonds</i>
              <br></br>Tituba Response
            </p>
          </div>
        </div>
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/10yOTzXQFT5ZSplL5OFiEYSUkhlplvT18B2fTynNymh0/edit?usp=sharing"
              )
            }
          >
            <img src="../School/History/1.png" alt="Notes" />
            <p>Exploring the US Constitution</p>
          </div>
        </div>
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/1PRpPjpyhAY5_xmmBF_gJCNuT8-xhw8vcut73Q-HASto/edit?usp=sharing"
              )
            }
          >
            <img src="../School/SRJC/2.png" alt="Cover letter" />
            <p>
              <i>Living With Less. A Lot Less.</i>
              <br></br> SRJC Summary
            </p>
          </div>
        </div>
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/13XfXMM_f6R_6vvGTwnPhsQFmWIiKMdJkLjknU8hnVMs/edit?usp=sharing"
              )
            }
          >
            <img src="../School/English/2.png" alt="Kindred response" />
            <p>Kindred Response</p>
          </div>
        </div>
        <div className="column">
          <div
            className="card"
            onClick={() =>
              openInNewTab(
                "https://docs.google.com/document/d/18nIHScOWG191CKY5H4uE2NiLeT3hpppe/edit?usp=sharing&ouid=114554228923627692181&rtpof=true&sd=true"
              )
            }
          >
            <img src="../School/History/2.png" alt="Reconstruction Response" />
            <p> US Reconstruction Response</p>
          </div>
        </div>
        <div className="column">
          <div className="card">
            <img src="../School/Math/2.PNG" alt="Conic Sections" />
            <p>Conic Sections</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
export default School;

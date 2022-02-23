import Gist from "react-gist";
import { motion } from "framer-motion";
import { openInNewTab } from "../../../../../Utils/openTab";
import "../styles.css";
function ReactSelect() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "linear" }}
      className="blog-text"
    >
      <header>
        <h1>Learning React Select for my New Project</h1>
        <p>11/29/21</p>
      </header>
      <section>
        <h2>Short Rant</h2>
        <p>
          Being a new web developer is hard. Having to come up with your own
          projects, working day and night to learn new technologies, the process
          can become stressful. Personally, I am thankful to have positive
          influences in the space that I can rely on for advice. Nevertheless,
          we are all learning, and many of us are in different stages of that
          process. Though I am still in the beginning process of my learning, I
          hope to offer some insight that is helpful. Anyways, onto React
          Select!
        </p>
      </section>
      <section>
        <h2>Project</h2>
        <p>
          Though I don’t want to speak on my project too heavily in this
          article, as I’m sure I’ll do more in the future, I think it is
          important to give a basic gist on what I am trying to accomplish.
          There is a data set, and React Select offers options for that data
          set, I want the user to be able to cycle through the options, and
          maybe even input their own. So how do we do that?
        </p>
        <p>Start by installing react-select</p>
        <pre>
          <code>npm i react-select</code>
        </pre>
        <p>or</p>
        <pre>
          <code>yarn add react-select</code>
        </pre>
        <p>
          Then import React, React-Select, and maybe some useState for later
        </p>
        <pre>
          <code>
            import &#123;React, useState&#125; from "react"; import Select from
            "react-select";
          </code>
        </pre>
      </section>
      <section>
        <h2>Options</h2>
        <p>
          So for react-select, the user is going to need options to select from.
          So what options do you need for your project? For my project, the user
          sort data by their value ascending and descending. So lets establish
          these options. Options will be a variable in your project which will
          hold an array, with an object inside containing a value and a label.
        </p>
        <pre>
          <code>
            export const options = [&#123; value: "high-low", label: "Sort
            Ascending" &#125;,&#123; value: "low-high", label: "Sort Descending"
            &#125;];
          </code>
        </pre>
        <p>
          In my example, the user gets the labels of “Sort Ascending” and Sort
          “Descending”, but value that we interact with in the code will be
          “high-low”, “low-high”.
        </p>
        <p>
          To make our code more organized, lets puts this in a separate file and
          export it. Now we can import it into our project file.
        </p>
        <pre>
          <code>
            import &#123; React, useState &#125; from "react"; import Select
            from "react-select"; import &#123;options&#125; from "./options";
          </code>
        </pre>
      </section>
      <section>
        <h2>Quick Disclaimer</h2>
        <p>
          There are lots of possibilities in regards to options which will be
          explored a bit later. For more information please check out the
          react-select{" "}
          <span
            className="text-underline-hover"
            onClick={() => openInNewTab("https://react-select.com/home")}
          >
            documentation
          </span>
          .
        </p>
      </section>
      <section>
        <h2>Select Component</h2>
        <p>
          Now we need to use the Select component in our code. Make a React
          Component, and return the Select component inside passing in the
          options as a property. Now our code should look something like this.
        </p>
        <Gist id="450efdadb3525ce62431b72339a73f9d" />
        <p>
          We’ve done it! We now have our first select component with our options
          for a user to click. Just for fun, lets pass our component some more
          data. For my project I used these props.
        </p>
        <Gist id="de0903b1d064519923bf0a107c0696d4" />
        <p>
          Our <code>defaultValue</code> will be some state that we have yet to
          initialize and when the value changes, it will set our state to that
          new value. Now we can track the users input! The user can also clear
          the input with <code>isClearable</code>.
        </p>
      </section>
      <section>
        <h2>State</h2>
        <p>
          Lets initialize our state! Our project should now look similar to
          this.
        </p>
        <Gist id="05c93c326828798f51643b878e16ac34" />
      </section>
      <section>
        <h2>Heating Up!</h2>
        <p>
          Now I am going to add another select bar. But for the best user
          experience, should that bar always be on the page? Let’s make it to
          where the bar will only pop up if the user has clicked on a certain
          option. Here is what the project will now look like.
        </p>
        <Gist id="3788f1006fadefa59f62c4a8f1b98f57" />
        <p>
          Lets break this down. So we import some new options from our options
          file which we will use on our new elect component. Next, we also
          import some styling which you could customize if you wanted. Then we
          render our new select component with it’s specified options. In
          regards to the <code>className</code> , this will check if the{" "}
          <code>selectedSort</code> input has changed. If a user has not
          selected an input, then it will be <code>null</code> otherwise, the
          value will be the input. Now we can use our css file to change the
          display of the search bar based on the <code>className</code> .
        </p>
        <pre>
          <code>.search-inactive&#123;display: none;&#125;</code>
        </pre>
      </section>
      <section>
        <h2>Conclusion</h2>
        <p>
          I want to reiterate that I am very much still learning, so if there is
          anything that I myself can improve on please let me know. Also, there
          is so much more that react-select has to offer! I highly encourage you
          to check out react-select’s amazing{" "}
          <span
            className="text-underline-hover"
            onClick={() => openInNewTab("https://react-select.com/home")}
          >
            documentation
          </span>
          . I am so excited to go on this learning journey with you guys. It is
          so important to document the process and I will continue to write on
          what I’ve learned, am working on, and what inspires me. I hope to
          encourage you guys to do the same. Until next time!
        </p>
      </section>
    </motion.div>
  );
}
export default ReactSelect;

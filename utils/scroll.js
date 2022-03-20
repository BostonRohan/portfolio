import { scroller } from "react-scroll";
export const scroll = (element) => {
  return scroller.scrollTo(element, {
    duration: 1000,
    delay: 0,
    smooth: "easeInOutQuart",
  });
};

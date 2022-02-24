import { openInNewTab } from "../../Utils/openTab";
function Archives() {
  const pages = [
    "home.png",
    "reccomendation.png",
    "about.png",
    "projects.png",
    "contact.png",
  ];

  return (
    <div className="Archives">
      <h1>Website Archives</h1>
      <section>
        <h2>Version 1</h2>
        {pages.map((src, i) => {
          return (
            <img
              key={i}
              src={`../Projects/Website/v1/${src}`}
              alt="v1 archive"
              onClick={() => openInNewTab("https://bostonrohanv1.netlify.app/")}
            />
          );
        })}
      </section>
      <section>
        <h2>Version 2</h2>
        {pages.map((src, i) => {
          return (
            <img
              key={i}
              src={`../Projects/Website/v2/${src}`}
              alt="v2 archive"
            />
          );
        })}
      </section>
    </div>
  );
}
export default Archives;

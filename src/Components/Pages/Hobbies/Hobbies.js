import Loading from "../../../Utils/loading/loading";
import "./styles.css";

function Hobbies() {
  const playlists = [
    "https://open.spotify.com/embed/playlist/1QzxL3ckUy0VHjuVf6kYy4?utm_source=generator",
    "https://open.spotify.com/embed/playlist/2WGp5LEmUQ2CwuuLTkU2U0?utm_source=generator&theme=0",
    "https://open.spotify.com/embed/playlist/2R6uE6T2FUNhylPv9uA2Mq?utm_source=generator&theme=0",
  ];
  const books = [
    "../Books/giver.jpg",
    "../Books/seven.jpg",
    "../Books/steal.jpg",
  ];
  const shows = ["../Shows/attack.jpg", "../Shows/hunter.jpg"];

  return (
    <div className="Hobbies">
      <Loading />
      <h1>Tunes I enjoy</h1>
      <section className="music">
        {playlists.map((src, i) => {
          return (
            <iframe
              key={i}
              src={src}
              width="25%"
              height="380"
              frameBorder="0"
              allowFullScreen=""
              title={i}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          );
        })}
      </section>
      <h1>Books I'm Reading</h1>
      <section className="books">
        <img src="../Books/dreamland.jpg" alt="Dreamland Burning" />
        <section className="favorites">
          {books.map((src, i) => {
            return <img key={i} src={src} alt="" />;
          })}
        </section>
      </section>
      <h1>Shows I'm watching</h1>
      <section className="shows">
        {shows.map((src, i) => {
          return <img key={i} src={src} alt="" />;
        })}
      </section>
    </div>
  );
}
export default Hobbies;

import Landing from "../views/landing";
import Projects from "../views/projects";
import Footer from "../views/footer";
import Head from "next/head";

function Index() {
  return (
    <main>
      <Head>
        <meta
          name="description"
          content="Passionate Full-Stack Developer currently developing my skills and looking for opportunities, I love to code, listen to music, read, and watch anime."
        />
        <meta property="og:title" content="Boston Rohan" />
        <meta
          property="og:description"
          content="Passionate Full-Stack Developer currently developing my skills and looking for opportunities, I love to code, listen to music, read, and watch anime."
        />
        <meta property="og:url" content="https://bostonrohan.com/" />
      </Head>
      <Landing />
      <Projects />
      <Footer />
    </main>
  );
}
export default Index;

import Landing from "../views/landing";
import Projects from "../views/projects";
import Footer from "../views/footer";
import Head from "next/head";

function Index() {
  return (
    <main>
      <Head>
        <meta name="description" content="Boston Rohan website" />
        <meta property="og:title" content="Boston Rohan" />
        <meta property="og:description" content="Boston Rohan website" />
        <meta property="og:url" content="https://bostonrohan.com/" />
      </Head>
      <Landing />
      <Projects />
      <Footer />
    </main>
  );
}
export default Index;

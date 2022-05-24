import { MDXProvider } from "@mdx-js/react";
import Head from "next/head";
import { useRouter } from "next/router";

function Post({ children, meta }) {
  const router = useRouter();
  return (
    <main className="wrapper">
      <Head>
        <title>{meta.title}</title>
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://bostonrohan${router.asPath}`}
        />
        <link
          rel="canonical"
          href={`https://bostonrohan.com${router.asPath}`}
        />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        {meta.date && (
          <meta property="article:published_time" content={meta.date} />
        )}
      </Head>
      <MDXProvider>
        <article>{children}</article>
      </MDXProvider>
    </main>
  );
}

export default Post;

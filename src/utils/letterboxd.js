import * as Sentry from "@sentry/astro";

function decodeXml(value = "") {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, codePoint) =>
      String.fromCodePoint(Number(codePoint)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, codePoint) =>
      String.fromCodePoint(Number.parseInt(codePoint, 16)),
    )
    .trim();
}

function readTag(xml, tagName) {
  const match = xml.match(
    new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"),
  );
  return decodeXml(match?.[1] || "");
}

/**
 * @param {{ username?: string }} [options]
 */
export async function fetchLetterboxdActivity({ username } = {}) {
  const emptyActivity = {
    username: username || "",
    entry: null,
    error: null,
  };
  const normalizedUsername = username?.trim();

  if (!normalizedUsername) {
    return { ...emptyActivity, error: "Missing Letterboxd username" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
    return { ...emptyActivity, error: "Invalid Letterboxd username" };
  }

  try {
    const response = await fetch(
      `https://letterboxd.com/${normalizedUsername}/rss/`,
      { signal: AbortSignal.timeout(4_000) },
    );

    if (!response.ok) {
      throw new Error(`Letterboxd RSS request failed (${response.status})`);
    }

    const rss = await response.text();
    const items = rss.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const diaryEntries = items
      .map((item) => {
        const filmTitle = readTag(item, "letterboxd:filmTitle");
        const publishedAt = Date.parse(readTag(item, "pubDate"));
        const watchedAt = Date.parse(readTag(item, "letterboxd:watchedDate"));
        const description = readTag(item, "description");
        const posterUrl = description.match(/<img[^>]+src=["']([^"']+)/i)?.[1];

        if (!filmTitle || !Number.isFinite(watchedAt)) return null;

        return {
          title: filmTitle,
          coverImage: posterUrl || "",
          url: readTag(item, "link"),
          updatedAt: Math.floor(watchedAt / 1_000),
          publishedAt: Number.isFinite(publishedAt)
            ? Math.floor(publishedAt / 1_000)
            : 0,
          source: "Letterboxd",
          kind: "film",
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) => b.updatedAt - a.updatedAt || b.publishedAt - a.publishedAt,
      );

    return {
      username: normalizedUsername,
      entry: diaryEntries[0] || null,
      error: null,
    };
  } catch (error) {
    console.error("Letterboxd fetch error:", error);
    Sentry.captureException(error, {
      extra: { username: normalizedUsername },
      tags: { service: "letterboxd" },
    });
    return {
      ...emptyActivity,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch Letterboxd activity",
    };
  }
}

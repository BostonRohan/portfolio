import * as Sentry from "@sentry/astro";

const LASTFM_API_BASE = "https://ws.audioscrobbler.com/2.0/";

async function sanitizeText(input) {
  if (!input || typeof input !== "string") return input || "";
  try {
    const response = await fetch(`https://www.purgomalum.com/service/json?text=${encodeURIComponent(input)}`);
    if (!response.ok) return input;
    const json = await response.json();
    return json?.result ?? input;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { input },
      tags: { service: "purgomalum" },
    });
    console.error("Sanitization failed", error);
    return input;
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function createLastfmUrl(username) {
  return `https://www.last.fm/user/${username}`;
}

async function fetchLastfmMethod({ apiKey, username, method, limit = 5, period }) {
  if (!apiKey || !username) {
    return null;
  }

  const searchParams = new URLSearchParams({
    method,
    user: username,
    api_key: apiKey,
    format: "json",
    limit: String(limit),
  });

  if (period) {
    searchParams.set("period", period);
  }

  const response = await fetch(`${LASTFM_API_BASE}?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Last.fm request failed (${response.status}) for ${method}`);
  }

  return response.json();
}

export async function fetchLastfmData({
  apiKey,
  username,
  recentTrackLimit = 5,
  topArtistLimit = 6,
  topAlbumLimit = 6,
} = {}) {
  const emptyData = {
    username,
    profileUrl: username ? createLastfmUrl(username) : "",
    recentTracks: [],
    topArtists: [],
    topAlbums: [],
    error: null,
  };

  if (!apiKey || !username) {
    return {
      ...emptyData,
      error: "Missing Last.fm credentials",
    };
  }

  try {
    const [recentTracksResponse, topArtistsResponse, topAlbumsResponse] = await Promise.all([
      fetchLastfmMethod({
        apiKey,
        username,
        method: "user.getrecenttracks",
        limit: recentTrackLimit,
      }),
      fetchLastfmMethod({
        apiKey,
        username,
        method: "user.gettopartists",
        period: "1month",
        limit: topArtistLimit,
      }),
      fetchLastfmMethod({
        apiKey,
        username,
        method: "user.gettopalbums",
        period: "1month",
        limit: topAlbumLimit,
      }),
    ]);

    return {
      ...emptyData,
      recentTracks: normalizeArray(recentTracksResponse?.recenttracks?.track).map((track) => ({
        name: track?.name || "",
        artist: track?.artist?.["#text"] || "",
        album: track?.album?.["#text"] || "",
        url: track?.url || "",
        nowPlaying: track?.["@attr"]?.nowplaying === "true",
        playedAt: track?.date?.["#text"] || "",
      })),
      topArtists: normalizeArray(topArtistsResponse?.topartists?.artist).map((artist) => ({
        name: artist?.name || "",
        playcount: artist?.playcount || "",
        url: artist?.url || "",
      })),
      topAlbums: normalizeArray(topAlbumsResponse?.topalbums?.album).map((album) => ({
        name: album?.name || "",
        artist:
          typeof album?.artist === "string"
            ? album.artist
            : album?.artist?.name || "",
        playcount: album?.playcount || "",
        url: album?.url || "",
      })),
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { method: "fetchLastfmData" },
      extra: { username },
    });
    return {
      ...emptyData,
      error: error instanceof Error ? error.message : "Failed to fetch Last.fm data",
    };
  }
}

export async function fetchLastfmNowPlaying({ apiKey, username } = {}) {
  const emptyData = {
    username,
    profileUrl: username ? createLastfmUrl(username) : "",
    track: null,
    error: null,
  };

  if (!apiKey || !username) {
    return {
      ...emptyData,
      error: "Missing Last.fm credentials",
    };
  }

  try {
    const recentTracksResponse = await fetchLastfmMethod({
      apiKey,
      username,
      method: "user.getrecenttracks",
      limit: 1,
    });
    const track = normalizeArray(recentTracksResponse?.recenttracks?.track)[0];

    if (!track || track?.["@attr"]?.nowplaying !== "true") {
      return emptyData;
    }

    const [name, artist] = await Promise.all([
      sanitizeText(track?.name),
      sanitizeText(track?.artist?.["#text"]),
    ]);

    return {
      ...emptyData,
      track: {
        name,
        artist,
        url: track?.url || "",
      },
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { method: "fetchLastfmNowPlaying" },
      extra: { username },
    });
    return {
      ...emptyData,
      error: error instanceof Error ? error.message : "Failed to fetch Last.fm now playing",
    };
  }
}

import * as Sentry from "@sentry/astro";
import { z } from "zod";

const ANILIST_API_URL = "https://graphql.anilist.co";

const AniListMediaSchema = z.object({
  title: z.object({
    english: z.string().nullable(),
    romaji: z.string().nullable(),
  }),
  genres: z.array(z.string()),
});

const AniListUserSchema = z.object({
  name: z.string(),
  favourites: z.object({
    anime: z.object({
      nodes: z.array(AniListMediaSchema),
    }),
    manga: z.object({
      nodes: z.array(AniListMediaSchema),
    }),
  }),
  statistics: z.object({
    anime: z.object({
      genres: z.array(
        z.object({
          genre: z.string(),
          count: z.number(),
          meanScore: z.number(),
        })
      ),
      tags: z.array(
        z.object({
          tag: z.object({
            name: z.string(),
          }),
          count: z.number(),
        })
      ),
    }),
  }),
});

const AniListResponseSchema = z.object({
  data: z.object({
    User: AniListUserSchema,
  }),
});

export async function fetchAnilistData(userName) {
  const emptyData = {
    userName: "",
    favorites: { anime: [], manga: [] },
    topGenres: [],
    topTags: [],
    error: null,
  };

  if (!userName) {
    return { ...emptyData, error: "Missing AniList username" };
  }

  const query = `
    query ($userName: String) {
      User(name: $userName) {
        name
        favourites {
          anime {
            nodes {
              title {
                english
                romaji
              }
              genres
            }
          }
          manga {
            nodes {
              title {
                english
                romaji
              }
              genres
            }
          }
        }
        statistics {
          anime {
            genres(limit: 5, sort: COUNT_DESC) {
              genre
              count
              meanScore
            }
            tags(limit: 5, sort: COUNT_DESC) {
              tag {
                name
              }
              count
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { userName },
      }),
    });

    if (!response.ok) {
      const error = `AniList API request failed: ${response.status}`;
      console.error(error);
      Sentry.captureMessage(error, {
        level: "error",
        tags: { service: "anilist" },
        extra: { status: response.status, userName },
      });
      return { ...emptyData, error };
    }

    const json = await response.json();

    if (json?.errors?.length) {
      const error = `AniList API errors: ${JSON.stringify(json.errors)}`;
      console.error(error);
      Sentry.captureException(new Error("AniList API GraphQLErrors"), {
        extra: { errors: json.errors, userName },
        tags: { service: "anilist" },
      });
      return { ...emptyData, error };
    }

    const parsed = AniListResponseSchema.safeParse(json);

    if (!parsed.success) {
      const error = `Invalid AniList payload: ${parsed.error.issues
        .map((i) => i.message)
        .join(", ")}`;
      console.error(error, json);
      Sentry.captureException(parsed.error, {
        extra: { userName, json },
        tags: { service: "anilist" },
      });
      return { ...emptyData, error };
    }

    const user = parsed.data.data.User;

    return {
      userName: user.name,
      favorites: {
        anime: user.favourites.anime.nodes.map(
          (n) => n.title.english || n.title.romaji
        ),
        manga: user.favourites.manga.nodes.map(
          (n) => n.title.english || n.title.romaji
        ),
      },
      topGenres: user.statistics.anime.genres.map((g) => ({
        name: g.genre,
        count: g.count,
        score: g.meanScore,
      })),
      topTags: user.statistics.anime.tags.map((t) => ({
        name: t.tag.name,
        count: t.count,
      })),
      error: null,
    };
  } catch (error) {
    console.error("AniList fetch error:", error);
    Sentry.captureException(error, {
      extra: { userName },
      tags: { service: "anilist" },
    });
    return {
      ...emptyData,
      error: `Failed to fetch AniList data: ${error.message}`,
    };
  }
}

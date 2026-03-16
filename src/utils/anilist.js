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
  favourites: z
    .object({
      anime: z.object({
        nodes: z.array(AniListMediaSchema),
      }),
    })
    .optional(),
  statistics: z
    .object({
      anime: z.object({
        genres: z
          .array(
            z.object({
              genre: z.string(),
              count: z.number(),
              meanScore: z.number(),
            }),
          )
          .optional(),
        tags: z
          .array(
            z.object({
              tag: z.object({
                name: z.string(),
              }),
              count: z.number(),
            }),
          )
          .optional(),
      }),
    })
    .optional(),
});

const MediaListEntrySchema = z.object({
  status: z.string().optional(),
  score: z.number().nullable().optional(),
  progress: z.number().nullable().optional(),
  progressVolumes: z.number().nullable().optional(),
  updatedAt: z.number().optional(),
  media: z.object({
    title: z.object({
      romaji: z.string().nullable().optional(),
      english: z.string().nullable().optional(),
      native: z.string().nullable().optional(),
    }).optional(),
  }).optional(),
});

const MediaListGroupSchema = z.object({
  name: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  entries: z.array(MediaListEntrySchema).optional(),
});

const MediaListCollectionSchema = z.object({
  lists: z.array(MediaListGroupSchema).optional(),
  hasNextChunk: z.boolean().optional(),
});

const AniListResponseSchema = z.object({
  data: z.object({
    User: AniListUserSchema,
    mediaListCollection: MediaListCollectionSchema.optional(),
  }),
});

export async function fetchAnilistData(userName) {
  const emptyData = {
    userName: "",
    favorites: { anime: [] },
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
        siteUrl
        mediaListOptions {
          scoreFormat
        }
        favourites {
          anime(perPage: 25) {
            nodes {
              title {
                romaji
                english
                native
              }
              genres
              description(asHtml: false)
              coverImage {
                large
                color
              }
              siteUrl
            }
          }
        }
        statistics {
          anime {
            count
            meanScore
            minutesWatched
            genres(limit: 10, sort: COUNT_DESC) {
              genre
              count
              meanScore
            }
            tags(limit: 10, sort: COUNT_DESC) {
              tag {
                name
              }
              count
            }
          }
        }
      }
      mediaListCollection: MediaListCollection(
        userName: $userName
        type: ANIME
        status_in: [CURRENT, REPEATING, PLANNING, COMPLETED]
        perChunk: 200
        sort: [UPDATED_TIME_DESC]
      ) {
        hasNextChunk
        lists {
          name
          status
          entries {
            status
            score
            progress
            progressVolumes
            updatedAt
            media {
              title {
                romaji
                english
                native
              }
              format
              episodes
              duration
              season
              seasonYear
              genres
              tags {
                name
              }
              coverImage {
                large
                color
              }
              description(asHtml: false)
              siteUrl
            }
          }
        }
      }
    }
  `;

  try {
    const requestBody = JSON.stringify({ query, variables: { userName } });
    const response = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: requestBody,
    });

    if (!response.ok) {
      const responseBody = await response.text();
      const error = `AniList API request failed: ${response.status}`;
      console.error(error, { status: response.status, body: responseBody, userName });
      Sentry.captureMessage(error, {
        level: "error",
        tags: { service: "anilist" },
        extra: {
          status: response.status,
          userName,
          request: requestBody,
          response: responseBody,
        },
      });
      return { ...emptyData, error: `${error}: ${responseBody}` };
    }

    const responseText = await response.text();
    const json = JSON.parse(responseText);

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
    const mediaListCollection = parsed.data.data.mediaListCollection;

    return {
      userName: user.name,
      favorites: {
        anime:
          user.favourites?.anime.nodes.map(
            (n) => n.title.english || n.title.romaji,
          ) || [],
      },
      topGenres:
        user.statistics?.anime.genres.map((g) => ({
          name: g.genre,
          count: g.count,
          score: g.meanScore,
        })) || [],
      topTags:
        user.statistics?.anime.tags.map((t) => ({
          name: t.tag.name,
          count: t.count,
        })) || [],
      watching: (mediaListCollection?.lists || [])
        .flatMap((list) => list.entries || [])
        .filter(
          (entry) => entry.status === "CURRENT" || entry.status === "REPEATING",
        )
        .map((entry) => ({
          title: entry.media?.title?.english || entry.media?.title?.romaji || entry.media?.title?.native || "(unknown title)",
          score: entry.score || 0,
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

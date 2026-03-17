import * as Sentry from "@sentry/astro";
import { z } from "zod";

const GITHUB_API_URL = "https://api.github.com/graphql";

const GitHubLanguageSchema = z.object({
  node: z.object({
    name: z.string(),
  }),
});

const GitHubTopicSchema = z.object({
  node: z.object({
    topic: z.object({
      name: z.string(),
    }),
  }),
});

const GitHubProjectSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string().nullable(),
  homepageUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isArchived: z.boolean(),
  owner: z.object({
    id: z.string(),
  }),
  latestRelease: z
    .object({
      tagName: z.string(),
    })
    .nullable(),
  languages: z.object({
    edges: z.array(GitHubLanguageSchema),
  }),
  repositoryTopics: z.object({
    edges: z.array(GitHubTopicSchema),
  }),
});

const GitHubUserSchema = z.object({
  id: z.string(),
  avatarUrl: z.string(),
  pinnedItems: z.object({
    nodes: z.array(GitHubProjectSchema),
  }),
});

const GitHubResponseSchema = z.object({
  data: z.object({
    user: GitHubUserSchema,
  }),
});

function getGitHubResponseMetadata(response) {
  const headers = response.headers;
  const readHeader = (name) => headers.get(name) ?? undefined;
  let host;
  try {
    host = new URL(response.url).host;
  } catch (error) {
    host = undefined;
  }
  return {
    url: response.url,
    host,
    enterpriseVersion: readHeader("x-github-enterprise-version"),
    mediaType: readHeader("x-github-media-type"),
    requestId: readHeader("x-github-request-id"),
  };
}

export async function fetchPinnedGithubData({ githubUsername, githubAccessToken }) {
  const emptyData = {
    githubUserId: "",
    avatarUrl: "",
    projects: [],
    error: null,
  };

  if (!githubUsername || !githubAccessToken) {
    return {
      ...emptyData,
      error: "Missing GitHub credentials",
    };
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        id
        avatarUrl
        pinnedItems(first: 6, types: [REPOSITORY]) {
          nodes {
            __typename
            ... on Repository {
              name
              url
              description
              homepageUrl
              createdAt
              updatedAt
              isArchived
              owner {
                id
              }
              latestRelease {
                tagName
              }
              languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  node {
                    name
                  }
                }
              }
              repositoryTopics(first: 10) {
                edges {
                  node {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const requestBody = JSON.stringify({
      query,
      variables: { username: githubUsername },
    });
    const response = await fetch(GITHUB_API_URL, {
      method: "POST",
      headers: {
        Authorization: `bearer ${githubAccessToken}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });
    const responseMetadata = getGitHubResponseMetadata(response);

    if (!response.ok) {
      const responseBody = await response.text();
      const error = `GitHub API request failed: ${response.status}`;
      console.error(error, { status: response.status, githubUsername, responseBody }, responseMetadata);
      Sentry.captureMessage(error, {
        level: "error",
        tags: { service: "github" },
        extra: {
          status: response.status,
          githubUsername,
          request: requestBody,
          response: responseBody,
          githubMetadata: responseMetadata,
        },
      });
      return { ...emptyData, error: `${error}: ${responseBody}` };
    }

    const json = await response.json();

    if (json?.errors?.length) {
      const error = `GitHub API errors: ${JSON.stringify(json.errors)}`;
      console.error(error, responseMetadata);
      Sentry.captureException(new Error("GitHub API GraphQLErrors"), {
        extra: { errors: json.errors, githubUsername, githubMetadata: responseMetadata },
        tags: { service: "github" },
      });
      return {
        ...emptyData,
        error,
      };
    }

    const normalizedResponse = (() => {
      const nodes = json?.data?.user?.pinnedItems?.nodes;
      if (!Array.isArray(nodes)) {
        return json;
      }
      const repositoryNodes = nodes.filter((node) => node?.__typename === "Repository");
      if (repositoryNodes.length === nodes.length) {
        return json;
      }
      return {
        ...json,
        data: {
          ...json.data,
          user: {
            ...json.data.user,
            pinnedItems: {
              ...json.data.user.pinnedItems,
              nodes: repositoryNodes,
            },
          },
        },
      };
    })();

    const parsedProjects = GitHubResponseSchema.safeParse(normalizedResponse);

    if (!parsedProjects.success) {
      const error = `Invalid GitHub project payload: ${parsedProjects.error.issues
        .map((i) => i.message)
        .join(", ")}`;
      console.error(error, json);
      Sentry.captureException(parsedProjects.error, {
        extra: { githubUsername, json, githubMetadata: responseMetadata },
        tags: { service: "github" },
      });
      return {
        ...emptyData,
        error,
      };
    }

    return {
      githubUserId: parsedProjects.data.data.user.id,
      avatarUrl: parsedProjects.data.data.user.avatarUrl,
      projects: parsedProjects.data.data.user.pinnedItems.nodes.filter(
        (repo) => repo.name !== "portfolio",
      ),
      error: null,
    };
  } catch (error) {
    console.error("GitHub fetch error:", error);
    Sentry.captureException(error, {
      extra: { githubUsername },
      tags: { service: "github" },
    });
    return {
      ...emptyData,
      error: `Failed to fetch pinned items from GitHub: ${error.message}`,
    };
  }
}

export function computeLanguageStats(projects) {
  const languageCounts = {};
  const totalProjects = projects.length;

  projects.forEach((repo) => {
    const languageEdges = repo.languages?.edges || [];
    const uniqueLanguages = [...new Set(languageEdges.map((edge) => edge?.node?.name).filter(Boolean))];

    uniqueLanguages.forEach((lang) => {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
  });

  return Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      projectCount: count,
      totalProjects,
      percent: Math.round((count / totalProjects) * 100),
    }))
    .sort((a, b) => b.projectCount - a.projectCount);
}

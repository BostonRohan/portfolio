import { z } from "zod";

const LanguageEdgeSchema = z.object({
  node: z.object({
    name: z.string(),
  }),
});

const TopicEdgeSchema = z.object({
  node: z.object({
    topic: z.object({
      name: z.string(),
    }),
  }),
});

const PinnedProjectSchema = z.object({
  name: z.string(),
  isArchived: z.boolean(),
  homepageUrl: z
    .string()
    .nullable()
    .optional()
    .transform((value) => value || ""),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  url: z.string(),
  latestRelease: z
    .object({
      tagName: z.string(),
    })
    .nullable()
    .optional()
    .default(null),
  languages: z.object({
    edges: z.array(LanguageEdgeSchema).default([]),
  }),
  repositoryTopics: z
    .object({
      edges: z.array(TopicEdgeSchema).default([]),
    })
    .nullable()
    .optional()
    .default({ edges: [] }),
  owner: z.object({
    id: z.string(),
  }),
});

const PinnedProjectListSchema = z.array(PinnedProjectSchema);
const GITHUB_PINNED_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let pinnedGithubCache = null;

const PINNED_REPOS_QUERY = (githubUsername) => `
{
  user(login: "${githubUsername}") {
    id
    avatarUrl
    pinnedItems(first: 8, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          isArchived
          archivedAt
          homepageUrl
          description
          createdAt
          updatedAt
          url
          owner {
            id
          }
          latestRelease {
            tagName
          }
          languages(first: 6) {
            edges {
              node {
                name
              }
            }
          }
          repositoryTopics(first: 8) {
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

export async function fetchPinnedGithubData({
  githubUsername,
  githubAccessToken,
}) {
  if (pinnedGithubCache && pinnedGithubCache.expiresAt > Date.now()) {
    return pinnedGithubCache.value;
  }

  if (!githubUsername || !githubAccessToken) {
    return {
      githubUserId: null,
      avatarUrl: null,
      projects: [],
      error: "Missing GitHub credentials",
    };
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.github+json",
        Authorization: `Bearer ${githubAccessToken}`,
      },
      body: JSON.stringify({
        query: PINNED_REPOS_QUERY(githubUsername),
      }),
    });

    if (!response.ok) {
      return {
        githubUserId: null,
        avatarUrl: null,
        projects: [],
        error: `GitHub API request failed: ${response.status}`,
      };
    }

    const json = await response.json();

    if (json?.errors?.length) {
      return {
        githubUserId: null,
        avatarUrl: null,
        projects: [],
        error: `GitHub API errors: ${JSON.stringify(json.errors)}`,
      };
    }

    const rawProjects = (json?.data?.user?.pinnedItems?.nodes || []).filter(
      (project) => project?.name && project.name !== "portfolio",
    );
    const parsedProjects = PinnedProjectListSchema.safeParse(rawProjects);

    if (!parsedProjects.success) {
      return {
        githubUserId: null,
        avatarUrl: null,
        projects: [],
        error: `Invalid GitHub project payload: ${parsedProjects.error.issues
          .slice(0, 3)
          .map((issue) => issue.path.join("."))
          .join(", ")}`,
      };
    }

    const result = {
      githubUserId: json?.data?.user?.id || null,
      avatarUrl: json?.data?.user?.avatarUrl || null,
      projects: parsedProjects.data,
      error: null,
    };

    pinnedGithubCache = {
      expiresAt: Date.now() + GITHUB_PINNED_CACHE_TTL_MS,
      value: result,
    };

    return result;
  } catch (error) {
    return {
      githubUserId: null,
      avatarUrl: null,
      projects: [],
      error: `Failed to fetch pinned items from GitHub: ${error.message}`,
    };
  }
}

export function computeLanguageStats(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return [];
  }

  const totals = new Map();
  let countedProjects = 0;

  for (const project of projects) {
    const languageEdges = project?.languages?.edges || [];
    const uniqueLanguages = [...new Set(languageEdges.map((edge) => edge?.node?.name).filter(Boolean))];

    if (uniqueLanguages.length === 0) continue;
    countedProjects += 1;

    for (const language of uniqueLanguages) {
      totals.set(language, (totals.get(language) || 0) + 1);
    }
  }

  if (countedProjects === 0) return [];

  return [...totals.entries()]
    .map(([language, projectCount]) => ({
      language,
      projectCount,
      totalProjects: countedProjects,
      percent: Math.round((projectCount / countedProjects) * 100),
    }))
    .sort((a, b) => b.projectCount - a.projectCount || a.language.localeCompare(b.language));
}

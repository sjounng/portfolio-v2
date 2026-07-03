/**
 * GitHub GraphQL API 래퍼.
 *
 * pinned 레포 / contribution graph(잔디) 는 REST 에 없고 GraphQL 에만 있으며,
 * 공개 데이터라도 토큰이 필요하다.
 * .env.local 에 GITHUB_TOKEN (read:user 스코프의 classic PAT) 을 설정.
 */
export const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "sjounng";

export interface RepoLanguage {
  name: string;
  color: string | null;
  /** 저장소 내 사용 비율 (0~100) */
  percent: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string | null;
  /** 사용 언어 목록 (바이트 크기 기준 내림차순, 최대 8개) */
  languages: RepoLanguage[];
  updatedAt: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0~4
}

export interface GitHubProfile {
  name: string;
  login: string;
  bio: string | null;
  avatarUrl: string;
  url: string;
  followers: number;
  following: number;
  totalContributions: number;
  weeks: ContributionDay[][];
  pinned: GitHubRepo[];
  repos: GitHubRepo[];
}

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
query($login: String!) {
  user(login: $login) {
    name login bio avatarUrl url
    followers { totalCount }
    following { totalCount }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount contributionLevel }
        }
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name description url stargazerCount forkCount updatedAt
          primaryLanguage { name color }
          languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            edges { size node { name color } }
          }
        }
      }
    }
    repositories(
      first: 100
      privacy: PUBLIC
      isFork: false
      ownerAffiliations: OWNER
      orderBy: { field: CREATED_AT, direction: ASC }
    ) {
      nodes {
        name description url stargazerCount forkCount updatedAt
        primaryLanguage { name color }
        languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
          totalSize
          edges { size node { name color } }
        }
      }
    }
  }
}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRepo(r: any): GitHubRepo {
  const totalSize: number = r.languages?.totalSize ?? 0;
  const languages: RepoLanguage[] =
    totalSize > 0
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        r.languages.edges.map((e: any) => ({
          name: e.node.name,
          color: e.node.color ?? null,
          percent: (e.size / totalSize) * 100,
        }))
      : [];

  return {
    name: r.name,
    description: r.description,
    url: r.url,
    stars: r.stargazerCount,
    forks: r.forkCount,
    language: r.primaryLanguage?.name ?? null,
    languageColor: r.primaryLanguage?.color ?? null,
    languages,
    updatedAt: r.updatedAt,
  };
}

export async function getGitHubProfile(
  login: string = GITHUB_USERNAME
): Promise<GitHubProfile | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("[github] GITHUB_TOKEN is not set");
    return null;
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("[github] request failed", res.status, await res.text());
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      console.error("[github] graphql errors", JSON.stringify(json.errors));
      return null;
    }

    const u = json.data?.user;
    if (!u) return null;

    const cal = u.contributionsCollection.contributionCalendar;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const weeks: ContributionDay[][] = cal.weeks.map((w: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      w.contributionDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0,
      }))
    );

    return {
      name: u.name ?? u.login,
      login: u.login,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      url: u.url,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
      totalContributions: cal.totalContributions,
      weeks,
      pinned: u.pinnedItems.nodes.map(mapRepo),
      repos: u.repositories.nodes.map(mapRepo),
    };
  } catch (err) {
    console.error("[github] fetch error", err);
    return null;
  }
}

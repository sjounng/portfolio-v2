import { getGitHubProfile, GITHUB_USERNAME } from "@/lib/github";
import { ContributionGraph } from "@/components/github/contribution-graph";
import { RepoCard } from "@/components/github/repo-card";
import GitHubShell from "./github-shell";

export const revalidate = 3600;

export const metadata = {
  title: "GitHub · Junwoo Song",
};

export default async function GitHubPage() {
  const profile = await getGitHubProfile();

  if (!profile) {
    return (
      <GitHubShell>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">GitHub</h1>
        <p className="text-muted">
          GitHub 데이터를 불러올 수 없습니다. <code>.env.local</code> 의{" "}
          <code>GITHUB_TOKEN</code> 을 확인해주세요.
        </p>
      </GitHubShell>
    );
  }

  return (
    <GitHubShell>
      {/* 프로필 */}
      <section className="mb-10 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatarUrl}
          alt={profile.name}
          className="h-24 w-24 rounded-full border border-border"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-foreground"
          >
            @{profile.login}
          </a>
          {profile.bio && <p className="mt-2 text-foreground/80">{profile.bio}</p>}
          <div className="mt-2 flex justify-center gap-4 text-sm text-muted sm:justify-start">
            <span>
              <span className="font-semibold text-foreground">{profile.followers}</span> followers
            </span>
            <span>
              <span className="font-semibold text-foreground">{profile.following}</span> following
            </span>
          </div>
        </div>
      </section>

      {/* 잔디 */}
      <section className="mb-10">
        <ContributionGraph weeks={profile.weeks} total={profile.totalContributions} />
      </section>

      {/* 고정 레포 */}
      {profile.pinned.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold tracking-tight">📌 Pinned</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile.pinned.map((repo) => (
              <RepoCard key={repo.name} repo={repo} />
            ))}
          </div>
        </section>
      )}

      {/* 전체 레포 */}
      <section>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Repositories
          <span className="ml-2 text-base font-normal text-muted">{profile.repos.length}</span>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profile.repos.map((repo) => (
            <RepoCard key={repo.name} repo={repo} />
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-sm text-muted">
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          github.com/{GITHUB_USERNAME} 에서 더 보기 →
        </a>
      </p>
    </GitHubShell>
  );
}

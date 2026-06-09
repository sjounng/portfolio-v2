# Portfolio v2

Personal portfolio website built with Next.js

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Language**: TypeScript
- **Package Manager**: Yarn

## Getting Started

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Run linter
yarn lint
```

## Notion 연동 (공식 API)

`/notion` 페이지는 Notion 공식 API(`@notionhq/client`)로 데이터베이스의
글 목록을 가져와 직접 만든 렌더러(`src/components/notion`)로 출력합니다.
각 글은 `/notion/[pageId]` 에서 전체 페이지로 렌더됩니다.

설정 방법:

1. https://www.notion.so/my-integrations 에서 **internal integration** 생성
   (integration 과 노출할 페이지는 **같은 워크스페이스**에 있어야 함)
2. 발급된 `Internal Integration Secret` 을 `.env.local` 의 `NOTION_TOKEN` 에 입력
3. 노출할 데이터베이스에서 우측 상단 `•••` → **Connections** → 만든 integration 연결
   (웹에 "게시"한 것만으로는 API 접근이 안 됨 — 반드시 integration 연결 필요)
4. 데이터베이스 id 를 `.env.local` 의 `NOTION_DATABASE_ID` 에 설정 (URL 끝의 32자 hex).
   비워두면 `src/lib/notion.ts` 의 기본값을 사용

ISR `revalidate = 3600`(1시간) 으로 캐시됩니다. 노션에 업로드한 이미지는
공식 API 가 임시(서명) URL 을 주므로 revalidate 주기 안에서만 유효합니다.
영구 표시가 필요하면 외부 이미지(URL embed)를 사용하세요.

## GitHub 연동

`/github` 페이지는 GitHub GraphQL API 로 프로필 · 잔디(contribution graph) ·
고정 레포 · 전체 레포를 가져옵니다. pinned/잔디는 REST 에 없어 GraphQL 이 필요하고,
공개 데이터라도 **토큰이 필수**입니다.

1. https://github.com/settings/tokens 에서 **classic** Personal Access Token 발급
   (스코프: `read:user` 면 충분)
2. `.env.local` 의 `GITHUB_TOKEN` 에 입력
3. 다른 계정을 보여주려면 `GITHUB_USERNAME` 설정 (기본값 `sjounng`)

## License

MIT

import { codeToHtml } from "shiki";

// 노션 언어명 → Shiki 언어 id 매핑
const LANG_MAP: Record<string, string> = {
  "c++": "cpp",
  "c#": "csharp",
  "objective-c": "objc",
  "plain text": "text",
  shell: "bash",
  "shell session": "bash",
  docker: "dockerfile",
  "f#": "fsharp",
};

/** 코드를 라이트/다크 듀얼 테마로 하이라이팅한 HTML 로 변환 (서버 전용). */
export async function highlightCode(code: string, notionLang: string): Promise<string> {
  const lang = LANG_MAP[notionLang?.toLowerCase()] ?? notionLang?.toLowerCase() ?? "text";
  // defaultColor 기본('light') → 라이트 색은 인라인 color 로 직접 적용되고,
  // 다크 색은 --shiki-dark 변수로 들어가 .dark 에서 CSS 로 덮어쓴다.
  try {
    return await codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
    });
  } catch {
    return await codeToHtml(code, {
      lang: "text",
      themes: { light: "github-light", dark: "github-dark" },
    });
  }
}

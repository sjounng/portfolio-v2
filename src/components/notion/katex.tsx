import katex from "katex";
import "katex/dist/katex.min.css";

/** LaTeX 수식을 서버에서 HTML 로 렌더한다 (클라이언트 JS 불필요). */
export function Katex({ expr, block = false }: { expr: string; block?: boolean }) {
  if (!expr) return null;

  let html: string;
  try {
    html = katex.renderToString(expr, {
      throwOnError: false,
      displayMode: block,
    });
  } catch {
    return <code>{expr}</code>;
  }

  if (block) {
    return (
      <div
        className="my-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

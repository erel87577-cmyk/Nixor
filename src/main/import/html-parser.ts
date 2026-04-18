export interface ParsedSourceDraft {
  title: string;
  body: string;
  imageUrls: string[];
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

export function parseSourceHtml(html: string): ParsedSourceDraft {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const imageUrls = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((match) => match[1]);
  const body = decodeHtmlEntities(html.replace(/<script[\s\S]*?<\/script>/gi, " "))
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: titleMatch?.[1]?.trim() || "Untitled import",
    body: body.slice(0, 4000),
    imageUrls,
  };
}

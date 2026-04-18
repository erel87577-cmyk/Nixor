export interface ParsedSourceDraft {
  title: string;
  body: string;
  imageUrls: string[];
  sourceTags: string[];
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
  const relTags = [...html.matchAll(/<(?:a|span|li)[^>]*(?:rel=["']tag["']|class=["'][^"']*(?:tag|tags|chip|badge|label)[^"']*["'])[^>]*>([\s\S]*?)<\/(?:a|span|li)>/gi)]
    .map((match) => decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()))
    .filter(Boolean);
  const metaTags = [...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:article:tag|keywords)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)]
    .flatMap((match) =>
      decodeHtmlEntities(match[1])
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    );
  const body = decodeHtmlEntities(html.replace(/<script[\s\S]*?<\/script>/gi, " "))
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sourceTags = [...new Set([...relTags, ...metaTags])];

  return {
    title: titleMatch?.[1]?.trim() || "Untitled import",
    body: body.slice(0, 4000),
    imageUrls,
    sourceTags,
  };
}

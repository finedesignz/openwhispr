import topics from "../config/productHelpTopics.json" with { type: "json" };
import fork from "../config/fork.config.json" with { type: "json" };

// Help citations link to the fork's docs when DOCS_URL is set. Until Titanium Whisper
// has its own docs they link to the upstream user docs (HELP_LINK_ORIGIN), which
// describe the same features; links only, live lookup stays off without DOCS_URL.
export const DOCS_ORIGIN = (fork.DOCS_URL || fork.HELP_LINK_ORIGIN).replace(/\/+$/, "");

export function bundledHelp(topic, reason) {
  const article = topics[topic];
  return {
    source: "bundled",
    reason,
    retrievedAt: null,
    articles: [
      { title: topic, url: DOCS_ORIGIN + article.path, path: article.path, text: article.text },
    ],
  };
}

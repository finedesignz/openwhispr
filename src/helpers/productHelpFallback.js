import topics from "../config/productHelpTopics.json" with { type: "json" };
import fork from "../config/fork.config.json" with { type: "json" };

// Help citations link to the fork's docs when DOCS_URL is set. Titanium Whisper has no
// docs site yet, so they link to the upstream user docs, which describe the same
// features. Links only: live lookup stays off without DOCS_URL (productHelp.js).
// test/config/forkBrand.test.js allows this one upstream host, on this line only.
export const UPSTREAM_DOCS_ORIGIN = "https://docs.openwhispr.com"; // fork-allow-upstream-link
export const DOCS_ORIGIN = (fork.DOCS_URL || UPSTREAM_DOCS_ORIGIN).replace(/\/+$/, "");

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

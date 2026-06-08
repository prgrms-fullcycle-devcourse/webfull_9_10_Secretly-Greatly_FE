import type { MockTab } from "./types";

export const NEWS_FEED_TAB: MockTab = {
  id: "news-feed",
  filename: "news.feed",
  path: ["src", "news"],
  content: [],
  view: "newsFeed",
};

export const POSITIONS_TAB: MockTab = {
  id: "positions",
  filename: "positions.json",
  path: ["src", "my stock"],
  content: [],
  view: "positions",
};

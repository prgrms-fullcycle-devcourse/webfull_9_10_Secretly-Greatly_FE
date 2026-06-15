export interface MockTab {
  id: string;
  filename: string;
  path: string[];
  content: string[];
  view?: "newsFeed" | "positions" | "stocksSheet" | "stockBigChart";
}

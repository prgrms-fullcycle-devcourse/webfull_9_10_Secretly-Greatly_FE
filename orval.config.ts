import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "http://localhost:3000/api-docs-json",
    },
    output: {
      mode: "tags-split",
      target: "./src/shared/api/generated",
      schemas: "./src/shared/api/generated/model",
      client: "react-query",
      httpClient: "axios",
      mock: true,
      override: {
        mutator: {
          path: "./src/shared/api/customInstance.ts",
          name: "customInstance",
        },
      },
    },
  },
});

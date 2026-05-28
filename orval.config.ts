import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      // TODO: 백엔드 Swagger/OpenAPI spec URL 또는 로컬 json 파일 경로로 수정해 주세요.
      // 예: 'http://localhost:8080/api-docs' 또는 './swagger.json'
      target: "http://localhost:8080/api-docs",
    },
    output: {
      mode: "tags-split", // Swagger의 태그별로 파일 분할 생성 (auth.ts, user.ts 등)
      target: "./src/shared/api/generated",
      schemas: "./src/shared/api/generated/model",
      client: "react-query", // React Query 훅 생성 (useQuery, useMutation 등)
      mock: true, // MSW 모킹 핸들러도 같이 자동 생성 (테스트 및 모킹에 유용)
      override: {
        mutator: {
          path: "./src/shared/api/customInstance.ts",
          name: "customInstance",
        },
      },
    },
  },
});

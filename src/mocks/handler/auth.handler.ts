import { http, HttpResponse } from "msw";

export const authHandlers = [
  // 로그인 성공 모킹 핸들러
  http.post("*/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as any;

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: "/api/auth/login",
          message: "이메일과 비밀번호를 입력해주세요.",
          data: null,
          error: "Bad Request",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      statusCode: 200,
      timestamp: new Date().toISOString(),
      path: "/api/auth/login",
      message: "로그인에 성공했습니다. 에디터 세션이 동기화됩니다.",
      data: {
        userId: "mock-user-id-12345",
        fixedNickname: "test_user",
        accessToken: "mock-jwt-access-token-abcde",
      },
      error: null,
    });
  }),

  // 익명 임시 세션 발급 핸들러
  http.post("*/api/auth/anonymous", () => {
    return HttpResponse.json({
      statusCode: 201,
      timestamp: new Date().toISOString(),
      path: "/api/auth/anonymous",
      message: "익명 임시 세션 발급이 완료되었습니다.",
      data: {
        userId: "mock-anonymous-user-id",
        anonymousToken: "mock-anonymous-token-uuid",
        accessToken: "mock-jwt-anonymous-token-xyz",
      },
      error: null,
    });
  }),
];

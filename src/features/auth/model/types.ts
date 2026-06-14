/** 로그인 요청 바디. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 로그인 성공 시 응답 data. */
export interface LoginResult {
  userId: string;
  fixedNickname: string;
  accessToken: string;
}

/** 회원가입 요청 바디 (BE SignupRequestDto). */
export interface SignupRequest {
  email: string;
  fixedNickname: string;
  password: string;
  checkPassword: string;
}

/** 회원가입 성공 시 응답 data. */
export interface SignupResult {
  userId: string;
}

/** 내 정보 조회(GET /api/auth/me) 응답 data — 토큰 검증 겸용. */
export interface MeResult {
  userId: string;
  email: string | null;
  nickname: string;
  isAnonymous: boolean;
  createdAt: string;
}

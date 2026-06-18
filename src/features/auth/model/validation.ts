import type { LoginRequest, SignupRequest } from "./types";

export interface LoginErrors {
  email?: string;
  password?: string;
}

export interface SignupErrors {
  email?: string;
  fixedNickname?: string;
  password?: string;
  checkPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 비밀번호 규칙 (BE SignupRequestDto 와 정합): 8~16자, 영문·숫자·특수문자(@$!%*#?&). */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;
const PASSWORD_RE =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/;

/** 로그인 입력 검증 — 이메일 형식 + 필수값. */
export function validateLogin({ email, password }: LoginRequest): LoginErrors {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) errors.email = "이메일을 입력해주세요.";
  else if (!EMAIL_RE.test(trimmedEmail))
    errors.email = "올바른 이메일 형식이 아닙니다.";

  if (!password) errors.password = "비밀번호를 입력해주세요.";

  return errors;
}

/** 비밀번호 찾기 입력 검증 — 이메일 형식 + 필수값만. */
export function validateResetRequest(email: string): LoginErrors {
  const errors: LoginErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) errors.email = "이메일을 입력해주세요.";
  else if (!EMAIL_RE.test(trimmedEmail))
    errors.email = "올바른 이메일 형식이 아닙니다.";

  return errors;
}

/** 비밀번호 규칙 검증 — 통과 시 null, 위반 시 메시지. (회원가입·비밀번호 변경 공용) */
export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `비밀번호는 ${PASSWORD_MIN}~${PASSWORD_MAX}자여야 합니다.`;
  }
  if (!PASSWORD_RE.test(password)) {
    return "영문·숫자·특수문자(@$!%*#?&)를 모두 포함해야 합니다.";
  }
  return null;
}

/** 회원가입 입력 검증 — BE SignupRequestDto 규칙과 정합. */
export function validateSignup({
  email,
  fixedNickname,
  password,
  checkPassword,
}: SignupRequest): SignupErrors {
  const errors: SignupErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) errors.email = "이메일을 입력해주세요.";
  else if (!EMAIL_RE.test(trimmedEmail))
    errors.email = "올바른 이메일 형식이 아닙니다.";

  if (!fixedNickname.trim()) errors.fixedNickname = "닉네임을 입력해주세요.";

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  if (!checkPassword) errors.checkPassword = "비밀번호 확인을 입력해주세요.";
  else if (password !== checkPassword)
    errors.checkPassword = "비밀번호가 일치하지 않습니다.";

  return errors;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}

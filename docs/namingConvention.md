# Naming Convention

프로젝트에서 새로 작성하거나 수정하는 코드의 네이밍은 아래 규칙을 따릅니다.
프레임워크 또는 도구가 정해 둔 이름은 예외로 유지합니다.

## Common Rules

| 대상           | 규칙               | 예시                                 |
| -------------- | ------------------ | ------------------------------------ |
| 상수           | `UPPER_SNAKE_CASE` | `API_BASE_URL`, `MAX_IMAGE_COUNT`    |
| 변수           | `camelCase`        | `userName`, `profileURL`             |
| 함수           | `camelCase`        | `fetchUserProfile`, `convertJPGFile` |
| React 컴포넌트 | `PascalCase`       | `LoginForm`, `ProfileCard`           |
| 폴더           | `camelCase`        | `userProfile`, `sharedComponents`    |
| 파일           | `camelCase`        | `loginForm.tsx`, `formatDate.ts`     |
| 타입           | `PascalCase`       | `UserProfile`, `LoginRequest`        |
| 인터페이스     | `PascalCase`       | `UserProfileProps`, `AuthResponse`   |
| 배열           | 복수형             | `users`, `selectedImages`            |

## Abbreviations

약어는 대문자로 작성합니다.

```ts
const profileURL = "https://example.com/profile";
const JPG_EXTENSION = ".jpg";

function convertJPGFile(fileURL: string) {
  return fileURL;
}

type APIResponse = {
  imageURLs: string[];
};
```

대표 약어 예시는 `API`, `HTML`, `ID`, `JPG`, `URL`입니다.

## Constants

런타임 동안 재할당하지 않는 값이라는 이유만으로 모든 `const` 변수를
대문자로 작성하지 않습니다. 설정값, 고정값, 공통으로 사용하는 상수에
`UPPER_SNAKE_CASE`를 사용합니다.

```ts
const API_BASE_URL = "/api";
const MAX_UPLOAD_COUNT = 5;

const userName = "홍길동";
const selectedImages = [];
```

## TypeScript Types

타입과 인터페이스 이름은 `PascalCase`를 사용하고, `I` 또는 `T` 접두사는
붙이지 않습니다.

```ts
interface LoginFormProps {
  redirectURL: string;
}

type UserProfile = {
  userID: number;
  imageURLs: string[];
};
```

## Files And Folders

일반 소스 파일과 폴더는 `camelCase`로 작성합니다.

```text
src/
  features/
    userProfile/
      userProfileCard.tsx
      useUserProfile.ts
  shared/
    formatDate.ts
```

다음 파일은 Next.js 또는 개발 도구에서 이름을 인식하므로 예외입니다.

```text
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
next.config.ts
eslint.config.mjs
commitlint.config.mjs
package.json
README.md
CODEOWNERS
PULL_REQUEST_TEMPLATE.md
```

## Review Checklist

- 상수는 `UPPER_SNAKE_CASE`로 작성했는가?
- 변수와 함수는 `camelCase`로 작성했는가?
- 약어는 `URL`, `JPG`, `API`처럼 대문자로 작성했는가?
- 일반 폴더와 파일은 `camelCase`로 작성했는가?
- 타입과 인터페이스는 `PascalCase`로 작성했는가?
- 배열을 담는 변수와 속성은 복수형으로 작성했는가?

## Enforcement

다음 항목은 `pnpm lint` 및 commit 시 자동 검사합니다.

- 변수와 함수의 `camelCase`
- React 컴포넌트의 `PascalCase` 예외 허용
- 타입과 인터페이스의 `PascalCase`
- `URL`, `JPG`, `API`, `ID`, `HTML` 약어 표기
- `src` 아래 일반 파일과 폴더의 `camelCase`

다음 항목은 코드의 의미를 알아야 하므로 PR 리뷰에서도 확인합니다.

- `const` 변수 중 공통 상수로 사용하는 값의 `UPPER_SNAKE_CASE`
- 배열을 담는 변수와 속성의 복수형

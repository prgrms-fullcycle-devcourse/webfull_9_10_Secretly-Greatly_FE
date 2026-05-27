import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Next.js의 Image 컴포넌트를 표준 img 태그로 모킹하여 jsdom 환경에서 에러가 발생하지 않도록 합니다.
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const cleanProps = { ...props };
    delete cleanProps.priority;
    return React.createElement("img", cleanProps);
  },
}));

import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const cleanProps = { ...props };
    delete cleanProps.priority;
    return React.createElement("img", cleanProps);
  },
}));

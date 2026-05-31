import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home Page", () => {
  it("실제 IdeShell 컴포넌트를 정상적으로 렌더링해야 한다", () => {
    // 1. Home 페이지를 렌더링 (실제 IdeShell 포함)
    render(<Home />);

    // 2. IdeShell 내부에 렌더링되는 요소가 있는지 확인합니다.
    // "File" 이라는 이름을 가진 버튼이 메뉴바의 "File"과 "New File..." 등 여러 개 존재하므로 getAllByRole을 사용합니다.
    const fileButtons = screen.getAllByRole("button", { name: /file/i });
    expect(fileButtons.length).toBeGreaterThan(0);
  });
});

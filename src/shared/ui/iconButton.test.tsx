import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./iconButton";

describe("IconButton", () => {
  it("label이 title과 aria-label로 정상적으로 렌더링되어야 한다", () => {
    render(<IconButton label="검색" />);

    const button = screen.getByRole("button", { name: "검색" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "검색");
  });

  it("사용자가 버튼을 클릭하면 onClick 핸들러가 호출되어야 한다", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<IconButton label="닫기" onClick={handleClick} />);
    const button = screen.getByRole("button", { name: "닫기" });

    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("window variant와 danger 옵션이 주어지면 위험 상태의 CSS 클래스가 적용되어야 한다", () => {
    render(<IconButton label="닫기" variant="window" danger={true} />);

    const button = screen.getByRole("button", { name: "닫기" });

    expect(button).toHaveClass("icon-btn--window");
    expect(button).toHaveClass("icon-btn--window-danger");
  });

  it("Codicon icon prop이 전달되면 icon 요소가 렌더링되어야 한다", () => {
    render(<IconButton label="추가" icon="codicon-add" />);

    // codicon 컴포넌트 내부 렌더링 확인
    const button = screen.getByRole("button", { name: "추가" });
    expect(button.querySelector(".codicon")).toBeInTheDocument();
  });
});

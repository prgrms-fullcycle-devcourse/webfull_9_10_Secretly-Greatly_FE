import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("기본 클래스(vs-input)를 가지고 렌더링되어야 한다", () => {
    render(<Input placeholder="텍스트 입력" />);

    const input = screen.getByPlaceholderText("텍스트 입력");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("vs-input");
  });

  it("추가적인 className을 전달받으면 기존 클래스에 병합되어야 한다", () => {
    render(<Input placeholder="테스트" className="custom-class" />);

    const input = screen.getByPlaceholderText("테스트");
    expect(input).toHaveClass("vs-input");
    expect(input).toHaveClass("custom-class");
  });

  it("width prop이 전달되면 style로 적용되어야 한다", () => {
    render(<Input placeholder="크기 테스트" width={200} />);

    const input = screen.getByPlaceholderText("크기 테스트");
    expect(input).toHaveStyle({ width: "200px" });
  });

  it("사용자 입력을 정상적으로 받을 수 있어야 한다", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="입력하세요" />);

    const input = screen.getByPlaceholderText("입력하세요");

    await user.type(input, "Hello Vitest");
    expect(input).toHaveValue("Hello Vitest");
  });
});

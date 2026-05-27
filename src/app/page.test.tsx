import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home Page", () => {
  it("renders the getting started header", () => {
    render(<Home />);

    // 메인 제목 텍스트가 정상적으로 화면에 나타나는지 확인합니다.
    const heading = screen.getByRole("heading", {
      name: /to get started, edit the page\.tsx file\./i,
    });

    expect(heading).toBeInTheDocument();
  });
});

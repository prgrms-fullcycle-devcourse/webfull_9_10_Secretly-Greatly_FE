import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home Page", () => {
  it("시작 화면을 렌더링해야 한다", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Secretly Greatly Code" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New File..." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Walkthroughs" }),
    ).toBeInTheDocument();
  });

  it("Explorer에서 파일을 클릭하면 에디터 탭으로 연다", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(
      screen.getByRole("button", { name: "Explorer (Ctrl+Shift+E)" }),
    );
    await user.click(screen.getByRole("treeitem", { name: "page.tsx" }));

    expect(screen.getByRole("tab", { name: "page.tsx" })).toBeInTheDocument();
    expect(
      screen.getByRole("tabpanel", { name: "page.tsx" }),
    ).toBeInTheDocument();
  });
});

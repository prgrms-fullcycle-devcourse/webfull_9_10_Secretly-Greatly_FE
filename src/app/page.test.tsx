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

    await user.click(screen.getByRole("treeitem", { name: "page.tsx" }));

    expect(screen.getByRole("tab", { name: "page.tsx" })).toBeInTheDocument();
    expect(
      screen.getByRole("tabpanel", { name: "page.tsx" }),
    ).toBeInTheDocument();
  });

  it("뉴스 피드에서 카테고리 필터가 동작해야 한다", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("treeitem", { name: "news.feed" }));
    await user.click(screen.getByRole("button", { name: "정책" }));

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", {
        name: "애플, 신규 서비스 구독 정책 변경 검토 보도",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "삼성전자, HBM3E 12단 양산 라인 가동 보도",
      }),
    ).not.toBeInTheDocument();
  });
});

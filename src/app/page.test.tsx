import { render, screen } from "@testing-library/react";
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
});

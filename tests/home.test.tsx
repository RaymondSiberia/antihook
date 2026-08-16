import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { metadata } from "../app/layout";
import Home from "../app/page";

describe("site identity", () => {
  it("renders the approved brand and hero copy everywhere", () => {
    render(<Home />);

    expect(screen.getAllByText("СО МНОЙ НЕ СЛУЧИТСЯ")).toHaveLength(2);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Уверен, что с тобой такого не случится?",
      }),
    ).toBeInTheDocument();

    expect(metadata.title).toBe(
      "Со мной не случится — тест на устойчивость к вербовке/манипуляциям",
    );
  });

  it("opens the same story dialog from the header and footer", async () => {
    const user = userEvent.setup();
    render(<Home />);

    const triggers = screen.getAllByRole("button", { name: "Рассказать о случае" });
    expect(triggers).toHaveLength(2);

    await user.click(triggers[0]);
    expect(screen.getByRole("dialog", { name: "Рассказать о случае" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Закрыть форму" }));

    await user.click(triggers[1]);
    expect(screen.getByRole("dialog", { name: "Рассказать о случае" })).toBeInTheDocument();
  });
});

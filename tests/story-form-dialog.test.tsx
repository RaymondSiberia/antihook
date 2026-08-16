import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StoryFormDialog } from "../app/components/StoryFormDialog";

function DialogHarness() {
  const [open, setOpen] = useState(true);
  return <StoryFormDialog isOpen={open} onClose={() => setOpen(false)} />;
}

describe("StoryFormDialog", () => {
  it.each([
    ["Мессенджер", "Аккаунт в соцсети"],
    ["Почта", "Твоя почта"],
    ["Телефон", "Твой номер телефона"],
  ])("shows the %s contact field", async (method, label) => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.selectOptions(screen.getByLabelText("Куда прислать ответ?"), method);

    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it("clears the contact when the method changes", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    const method = screen.getByLabelText("Куда прислать ответ?");
    await user.selectOptions(method, "Мессенджер");
    await user.type(screen.getByLabelText("Аккаунт в соцсети"), "@user");
    await user.selectOptions(method, "Почта");

    expect(screen.getByLabelText("Твоя почта")).toHaveValue("");
  });

  it("shows inline errors instead of submitting empty data", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.click(screen.getByRole("button", { name: "Рассказать" }));

    expect(screen.getByRole("alert", { name: "Выбери способ связи" })).toBeInTheDocument();
    expect(screen.getByText("Опиши свой случай")).toBeInTheDocument();
    expect(screen.queryByText("Спасибо, что поделился")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Куда прислать ответ?")).toHaveFocus();
  });

  it("rejects an invalid email address", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.selectOptions(screen.getByLabelText("Куда прислать ответ?"), "Почта");
    await user.type(screen.getByLabelText("Твоя почта"), "not-an-email");
    await user.type(screen.getByLabelText("Поделись своим случаем"), "Описание случая");
    await user.click(screen.getByRole("button", { name: "Рассказать" }));

    expect(screen.getByText("Укажи корректную почту")).toBeInTheDocument();
    expect(screen.getByLabelText("Твоя почта")).toHaveFocus();
  });

  it("shows the approved confirmation for valid data", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<DialogHarness />);

    await user.selectOptions(screen.getByLabelText("Куда прислать ответ?"), "Почта");
    await user.type(screen.getByLabelText("Твоя почта"), "person@example.com");
    await user.type(screen.getByLabelText("Поделись своим случаем"), "Описание случая");
    await user.click(screen.getByRole("button", { name: "Рассказать" }));

    expect(screen.getByText("Спасибо, что поделился")).toBeInTheDocument();
    expect(screen.queryByText(/данные|отправлен|сохранен/i)).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage).toHaveLength(0);
  });

  it("keeps focus inside the dialog after successful submission", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);

    await user.selectOptions(screen.getByLabelText("Куда прислать ответ?"), "Почта");
    await user.type(screen.getByLabelText("Твоя почта"), "person@example.com");
    await user.type(screen.getByLabelText("Поделись своим случаем"), "Описание случая");
    await user.click(screen.getByRole("button", { name: "Рассказать" }));

    expect(screen.getByRole("button", { name: "Закрыть" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Закрыть форму" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const { rerender } = render(<StoryFormDialog isOpen onClose={onClose} />);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    rerender(<StoryFormDialog isOpen={false} onClose={onClose} />);
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it("closes from the backdrop and resets entered data", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(<StoryFormDialog isOpen onClose={onClose} />);

    await user.selectOptions(screen.getByLabelText("Куда прислать ответ?"), "Телефон");
    await user.type(screen.getByLabelText("Твой номер телефона"), "+7 900 000-00-00");
    await user.click(screen.getByTestId("story-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();

    rerender(<StoryFormDialog isOpen={false} onClose={onClose} />);
    rerender(<StoryFormDialog isOpen onClose={onClose} />);
    expect(screen.getByLabelText("Куда прислать ответ?")).toHaveValue("");
  });

  it("traps focus and restores body scrolling after close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(<StoryFormDialog isOpen onClose={onClose} />);

    expect(document.body).toHaveStyle({ overflow: "hidden" });
    const close = screen.getByRole("button", { name: "Закрыть форму" });
    close.focus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Рассказать" })).toHaveFocus();

    rerender(<StoryFormDialog isOpen={false} onClose={onClose} />);
    expect(document.body.style.overflow).toBe("");
  });
});

# Story Form and Renaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the experience to «Со мной не случится» and add an accessible, local-only «Рассказать о случае» dialog opened from the header and footer.

**Architecture:** Keep `Home` responsible for the page and quiz, and move all story-form state, validation, success state, focus handling, and reset behavior into a focused `StoryFormDialog` client component. Add Vitest and Testing Library for red-green interaction tests while preserving the existing Sites and GitHub Pages builds.

**Tech Stack:** React 19, TypeScript, vinext/Vite, CSS, Vitest, Testing Library, GitHub Actions, OpenAI Sites.

## Global Constraints

- Brand copy must be exactly `СО МНОЙ НЕ СЛУЧИТСЯ` in the header and footer.
- Hero heading must be exactly `Уверен, что с тобой такого не случится?`.
- Page title must be exactly `Со мной не случится — тест на устойчивость к вербовке/манипуляциям`.
- The two `Рассказать о случае` triggers must live in the header and footer and open one shared dialog; in the header the button comes before `Куда обратиться`.
- Contact-method values and labels are `Мессенджер`, `Почта`, and `Телефон`.
- Contact-field labels are `Аккаунт в соцсети`, `Твоя почта`, and `Твой номер телефона`.
- All visible form fields are required.
- Submission must not send, persist, log, or otherwise expose entered data.
- The success state contains `Спасибо, что поделился` without explanatory copy.
- Closing the dialog must clear all entered values and return it to the form state.
- Existing quiz behavior and partner sections must remain unchanged.
- Both `npm run build` and `npm run build:pages` must pass before publication.

---

## File Structure

- Create `app/components/StoryFormDialog.tsx`: owns the story dialog, conditional contact field, validation, focus behavior, success state, and reset.
- Create `tests/setup.ts`: installs Testing Library DOM matchers and cleanup.
- Create `tests/home.test.tsx`: verifies brand copy, hero copy, and both dialog triggers.
- Create `tests/story-form-dialog.test.tsx`: verifies conditional fields, validation, success, reset, backdrop, Escape, and focus return.
- Create `vitest.config.ts`: jsdom test environment and React transform.
- Modify `app/page.tsx`: renders new copy, the two triggers, and one `StoryFormDialog`.
- Modify `app/layout.tsx`: updates site metadata.
- Modify `app/globals.css`: styles header/footer actions and the new dialog responsively.
- Modify `github-pages/index.html`: updates the static document title.
- Modify `.github/workflows/pages.yml`: deploys GitHub Pages from the approved `DEV` branch.
- Modify `package.json` and `package-lock.json`: adds unit-test dependencies and scripts.
- Replace `tests/rendered-html.test.mjs`: removes obsolete starter-skeleton assertions and adds a production render smoke test for the current site.

---

### Task 1: Test Harness and Brand Rename

**Files:**
- Create: `tests/setup.ts`
- Create: `tests/home.test.tsx`
- Create: `vitest.config.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `github-pages/index.html`
- Modify: `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: default `Home` export from `app/page.tsx`; `metadata` export from `app/layout.tsx`.
- Produces: `npm run test:unit`; stable brand and heading queries used by later integration tests.

- [ ] **Step 1: Add the unit-test runtime**

Add these dev dependencies:

```json
{
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "jsdom": "^26.1.0",
  "vitest": "^3.2.4"
}
```

Add scripts:

```json
{
  "test": "npm run test:unit",
  "test:unit": "vitest run",
  "test:render": "npm run build && node --test tests/rendered-html.test.mjs"
}
```

Run:

```bash
npm install
```

- [ ] **Step 2: Configure Vitest and DOM cleanup**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});
```

- [ ] **Step 3: Write the failing brand test**

Create `tests/home.test.tsx`:

```tsx
import { readFile } from "node:fs/promises";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { metadata } from "../app/layout";
import Home from "../app/page";

describe("site identity", () => {
  it("renders the approved brand and hero copy everywhere", async () => {
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

    const staticHtml = await readFile("github-pages/index.html", "utf8");
    expect(staticHtml).toContain(
      "<title>Со мной не случится — тест на устойчивость к вербовке/манипуляциям</title>",
    );

    const pagesWorkflow = await readFile(".github/workflows/pages.yml", "utf8");
    expect(pagesWorkflow).toContain("branches: [DEV]");
  });
});
```

- [ ] **Step 4: Run the test and verify RED**

Run:

```bash
npm run test:unit -- tests/home.test.tsx
```

Expected: FAIL because the interface still contains `АНТИКРЮЧОК`, the old hero heading, and the old metadata title.

- [ ] **Step 5: Apply the minimal copy changes**

In `app/page.tsx`:

```tsx
<a className="brand" href="#top" aria-label="Со мной не случится — на главную">
  <span className="brand-mark">↗</span>
  <span>СО МНОЙ НЕ СЛУЧИТСЯ</span>
</a>

<h1>Уверен, что с тобой<br /><em>такого не случится?</em></h1>
```

Apply the same brand text in the footer. In `app/layout.tsx` and `github-pages/index.html`, replace the title with:

```text
Со мной не случится — тест на устойчивость к вербовке/манипуляциям
```

In `.github/workflows/pages.yml`, change the push branch to:

```yaml
on:
  push:
    branches: [DEV]
```

- [ ] **Step 6: Run the unit test and verify GREEN**

Run:

```bash
npm run test:unit -- tests/home.test.tsx
```

Expected: PASS, 1 test passed.

- [ ] **Step 7: Commit the independently testable rename**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/home.test.tsx app/page.tsx app/layout.tsx github-pages/index.html .github/workflows/pages.yml
git commit -m "Rename Antihook experience"
```

---

### Task 2: Story Dialog State, Conditional Fields, and Validation

**Files:**
- Create: `app/components/StoryFormDialog.tsx`
- Create: `tests/story-form-dialog.test.tsx`

**Interfaces:**
- Consumes: `isOpen: boolean`, `onClose: () => void`.
- Produces: `StoryFormDialog({ isOpen, onClose }): JSX.Element | null`; visible form state and local-only success state.

- [ ] **Step 1: Write failing conditional-field tests**

Create `tests/story-form-dialog.test.tsx` with a reusable harness:

```tsx
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
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
npm run test:unit -- tests/story-form-dialog.test.tsx
```

Expected: FAIL because `app/components/StoryFormDialog.tsx` does not exist.

- [ ] **Step 3: Add the minimal dialog state and conditional contact field**

Create `app/components/StoryFormDialog.tsx` with these public types and state transitions:

```tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ContactMethod = "" | "Мессенджер" | "Почта" | "Телефон";

type StoryFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const contactField = {
  Мессенджер: { label: "Аккаунт в соцсети", type: "text" },
  Почта: { label: "Твоя почта", type: "email" },
  Телефон: { label: "Твой номер телефона", type: "tel" },
} as const;

export function StoryFormDialog({ isOpen, onClose }: StoryFormDialogProps) {
  const [method, setMethod] = useState<ContactMethod>("");
  const [contact, setContact] = useState("");
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function changeMethod(next: ContactMethod) {
    setMethod(next);
    setContact("");
  }

  if (!isOpen) return null;

  return (
    <div className="story-backdrop">
      <section role="dialog" aria-modal="true" aria-labelledby="story-dialog-title">
        <h2 id="story-dialog-title">Рассказать о случае</h2>
        <form>
          <label htmlFor="story-contact-method">Куда прислать ответ?</label>
          <select
            id="story-contact-method"
            value={method}
            onChange={(event) => changeMethod(event.target.value as ContactMethod)}
          >
            <option value="">Выбери способ связи</option>
            {Object.keys(contactField).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          {method && (
            <>
              <label htmlFor="story-contact">{contactField[method].label}</label>
              <input
                id="story-contact"
                type={contactField[method].type}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
              />
            </>
          )}

          <label htmlFor="story-text">Поделись своим случаем</label>
          <textarea
            id="story-text"
            value={story}
            onChange={(event) => setStory(event.target.value)}
          />
          <button type="submit">Рассказать</button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Run the conditional-field tests and verify GREEN**

Run:

```bash
npm run test:unit -- tests/story-form-dialog.test.tsx
```

Expected: PASS for the three contact-field cases and contact reset.

- [ ] **Step 5: Write failing validation and success tests**

Append:

```tsx
it("shows inline errors instead of submitting empty data", async () => {
  const user = userEvent.setup();
  render(<DialogHarness />);

  await user.click(screen.getByRole("button", { name: "Рассказать" }));

  expect(screen.getByText("Выбери способ связи")).toBeInTheDocument();
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
```

- [ ] **Step 6: Run the new tests and verify RED**

Run:

```bash
npm run test:unit -- tests/story-form-dialog.test.tsx
```

Expected: FAIL because submission has no validation or success state.

- [ ] **Step 7: Implement local validation and the success screen**

Add:

```tsx
type FormErrors = Partial<Record<"method" | "contact" | "story", string>>;

const [errors, setErrors] = useState<FormErrors>({});
const contactRef = useRef<HTMLInputElement>(null);
const selectRef = useRef<HTMLSelectElement>(null);
const storyRef = useRef<HTMLTextAreaElement>(null);

function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const nextErrors: FormErrors = {};

  if (!method) nextErrors.method = "Выбери способ связи";
  if (method && !contact.trim()) nextErrors.contact = "Заполни контакт";
  if (
    method === "Почта" &&
    contact.trim() &&
    contactRef.current?.validity.typeMismatch
  ) {
    nextErrors.contact = "Укажи корректную почту";
  }
  if (!story.trim()) nextErrors.story = "Опиши свой случай";

  setErrors(nextErrors);
  if (nextErrors.method) selectRef.current?.focus();
  else if (nextErrors.contact) contactRef.current?.focus();
  else if (nextErrors.story) storyRef.current?.focus();
  else setSubmitted(true);
}
```

Use `noValidate` on the form, add `required` to the select, active contact input, and textarea, attach the refs above, set `aria-invalid` and `aria-describedby` on errored fields, render each error in an element with `role="alert"`, and replace the form with:

```tsx
<div className="story-success" role="status">
  <span aria-hidden="true">✓</span>
  <h2>Спасибо, что поделился</h2>
  <button type="button" onClick={closeAndReset}>Закрыть</button>
</div>
```

- [ ] **Step 8: Run the component tests and verify GREEN**

Run:

```bash
npm run test:unit -- tests/story-form-dialog.test.tsx
```

Expected: PASS for conditional fields, reset-on-method-change, validation, and success.

- [ ] **Step 9: Commit the independently testable form behavior**

```bash
git add app/components/StoryFormDialog.tsx tests/story-form-dialog.test.tsx
git commit -m "Add local story form behavior"
```

---

### Task 3: Dialog Accessibility and Page Integration

**Files:**
- Modify: `app/components/StoryFormDialog.tsx`
- Modify: `tests/story-form-dialog.test.tsx`
- Modify: `tests/home.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `StoryFormDialog({ isOpen, onClose })` from Task 2.
- Produces: header and footer triggers; accessible close paths; focus return; responsive visual treatment.

- [ ] **Step 1: Write failing page-integration tests**

Append to `tests/home.test.tsx`:

```tsx
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
```

Add `userEvent` to the file imports.

- [ ] **Step 2: Write failing accessibility and reset tests**

Append to `tests/story-form-dialog.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```bash
npm run test:unit -- tests/home.test.tsx tests/story-form-dialog.test.tsx
```

Expected: FAIL because triggers, close button, Escape handling, backdrop handling, reset, and focus return are absent.

- [ ] **Step 4: Integrate the component once in `Home`**

Add:

```tsx
import { StoryFormDialog } from "./components/StoryFormDialog";

const [storyDialogOpen, setStoryDialogOpen] = useState(false);

<div className="header-actions">
  <button className="story-trigger header-story-trigger" onClick={() => setStoryDialogOpen(true)}>
    Рассказать о случае
  </button>
  <a className="header-link" href="#partners">Куда обратиться</a>
</div>

<div className="footer-actions">
  <button className="story-trigger footer-story-trigger" onClick={() => setStoryDialogOpen(true)}>
    Рассказать о случае
  </button>
  <a href="#top">Наверх ↑</a>
</div>

<StoryFormDialog
  isOpen={storyDialogOpen}
  onClose={() => setStoryDialogOpen(false)}
/>
```

- [ ] **Step 5: Implement close, reset, focus, Escape, and Tab containment**

In `StoryFormDialog`, add `dialogRef`, `selectRef`, and `openerRef`. Implement stable reset callbacks:

```tsx
const reset = useCallback(() => {
  setMethod("");
  setContact("");
  setStory("");
  setErrors({});
  setSubmitted(false);
}, []);

const closeAndReset = useCallback(() => {
  reset();
  onClose();
}, [onClose, reset]);
```

On open, capture `document.activeElement`, lock body scrolling, and focus the select. Register a `keydown` listener:

```tsx
useEffect(() => {
  if (!isOpen) return;
  openerRef.current = document.activeElement as HTMLElement | null;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  selectRef.current?.focus();

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") closeAndReset();
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener("keydown", onKeyDown);
  return () => {
    document.removeEventListener("keydown", onKeyDown);
    document.body.style.overflow = previousOverflow;
    openerRef.current?.focus();
  };
}, [closeAndReset, isOpen]);
```

Add `useCallback` to the React imports. Add a close button with `aria-label="Закрыть форму"` as the first focusable element. Give the backdrop `data-testid="story-backdrop"` and close only when `event.target === event.currentTarget`.

- [ ] **Step 6: Add focused responsive styles**

Add CSS classes without changing quiz styles:

```css
.header-actions,
.footer-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.story-trigger {
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  padding: 11px 16px;
  font-weight: 800;
  cursor: pointer;
}

.story-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(8, 14, 29, 0.84);
  backdrop-filter: blur(8px);
}

.story-dialog {
  width: min(680px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: clamp(28px, 5vw, 52px);
  border: 2px solid var(--ink);
  background: var(--white);
  box-shadow: 14px 14px 0 var(--lime);
}

.story-field {
  display: grid;
  gap: 8px;
  margin-top: 20px;
}

.story-field input,
.story-field select,
.story-field textarea {
  width: 100%;
  border: 1px solid var(--ink);
  background: white;
  padding: 14px 16px;
  color: var(--ink);
}

.story-field textarea {
  min-height: 160px;
  resize: vertical;
}

.story-error {
  color: #b42318;
  font-size: 13px;
}

@media (max-width: 560px) {
  .site-header { padding-inline: 16px; }
  .header-actions { gap: 10px; }
  .header-link { display: none; }
  .header-story-trigger { padding: 9px 11px; font-size: 12px; }
  .footer-actions { align-items: flex-start; flex-direction: column; }
  .story-dialog { padding: 28px 20px; box-shadow: 8px 8px 0 var(--lime); }
}
```

Add existing focus-ring treatment to `.story-trigger`, form controls, and `.story-close`.

- [ ] **Step 7: Run the focused tests and verify GREEN**

Run:

```bash
npm run test:unit -- tests/home.test.tsx tests/story-form-dialog.test.tsx
```

Expected: all home and dialog tests PASS.

- [ ] **Step 8: Commit integration and accessibility**

```bash
git add app/page.tsx app/globals.css app/components/StoryFormDialog.tsx tests/home.test.tsx tests/story-form-dialog.test.tsx
git commit -m "Integrate accessible story dialog"
```

---

### Task 4: Production Render Test and Full Verification

**Files:**
- Replace: `tests/rendered-html.test.mjs`

**Interfaces:**
- Consumes: vinext output in `dist/server/index.js`; GitHub Pages output in `pages-dist`.
- Produces: repeatable render and build evidence for both deployment targets.

- [ ] **Step 1: Replace obsolete starter assertions with current production coverage**

Replace the complete contents of `tests/rendered-html.test.mjs` so no starter-only imports or assertions remain:

```js
import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the current site identity", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Со мной не случится — тест на устойчивость к вербовке\/манипуляциям<\/title>/i);
  assert.match(html, /Уверен, что с тобой/);
  assert.match(html, /Рассказать о случае/);
  assert.doesNotMatch(html, /АНТИКРЮЧОК|Your site is taking shape/);
});
```

- [ ] **Step 2: Build once and verify the replacement coverage**

Run:

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

Expected: PASS. This is a coverage replacement for obsolete starter assertions; the rename behavior already completed a RED/GREEN cycle in Task 1.

- [ ] **Step 3: Run all unit tests**

Run:

```bash
npm run test:unit
```

Expected: all tests PASS with zero failures.

- [ ] **Step 4: Build and test the Sites target**

Run:

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

Expected: build exit code 0 and render test PASS.

- [ ] **Step 5: Build and inspect the GitHub Pages target**

Run:

```bash
npm run build:pages
rg -n "Со мной не случится|/antihook/assets/" pages-dist/index.html
```

Expected: build exit code 0; the generated HTML contains the new title and asset URLs under `/antihook/`.

- [ ] **Step 6: Run static quality checks**

Run:

```bash
npm run lint
git diff --check
git status --short --branch
```

Expected: lint exit code 0, no whitespace errors, and only intended files changed.

- [ ] **Step 7: Commit the verification update**

```bash
git add tests/rendered-html.test.mjs
git commit -m "Update production render coverage"
```

---

### Task 5: Publish Sites and GitHub Pages

**Files:**
- No product-source changes expected.

**Interfaces:**
- Consumes: verified HEAD containing Tasks 1–4.
- Produces: updated Sites deployment and updated `https://raymondsiberia.github.io/antihook/`.

- [ ] **Step 1: Re-run completion verification immediately before publication**

```bash
npm run test:unit
npm run build
node --test tests/rendered-html.test.mjs
npm run build:pages
git status --short --branch
```

Expected: every command exits 0 and the worktree is clean.

- [ ] **Step 2: Publish the verified commit to Sites**

Follow `sites:sites-hosting` using the existing project ID in `.openai/hosting.json`: push the exact verified HEAD to the Sites source repository, package the matching `dist`, save one new version, deploy it, and poll until the deployment status is `succeeded`.

- [ ] **Step 3: Sync the verified tree to GitHub `DEV`**

Use the connected GitHub app for `RaymondSiberia/antihook`. Create the exact verified file tree from local HEAD, create a fast-forward commit on top of remote `DEV`, and update the branch ref. If `DEV` does not exist yet, create it from the current remote `main` commit before applying the verified tree. Do not upload `.openai/hosting.json`, `node_modules`, `dist`, or `pages-dist`.

- [ ] **Step 4: Verify GitHub Actions and the public page**

Poll the `Deploy GitHub Pages` workflow for the new commit until it reaches `completed/success`, then request:

```text
https://raymondsiberia.github.io/antihook/
```

Expected: HTTP 200, document title `Со мной не случится — тест на устойчивость к вербовке/манипуляциям`, and the visible H1 `Уверен, что с тобой такого не случится?`.

- [ ] **Step 5: Report the two production URLs**

Return the updated GitHub Pages URL and Sites URL, state explicitly that the story form is local-only and sends no data, and mention that a real receiving service remains outside this iteration.

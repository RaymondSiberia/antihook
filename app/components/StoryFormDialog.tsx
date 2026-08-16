"use client";

import { FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const contactRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const storyRef = useRef<HTMLTextAreaElement>(null);
  const successCloseRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (isOpen && submitted) successCloseRef.current?.focus();
  }, [isOpen, submitted]);

  function changeMethod(next: ContactMethod) {
    setMethod(next);
    setContact("");
  }

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

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) closeAndReset();
  }

  if (!isOpen) return null;

  return (
    <div
      className="story-backdrop"
      data-testid="story-backdrop"
      role="presentation"
      onClick={closeFromBackdrop}
    >
      <section
        className="story-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-dialog-title"
      >
        <button
          className="story-close"
          type="button"
          aria-label="Закрыть форму"
          onClick={closeAndReset}
        >
          ×
        </button>
        {submitted ? (
          <div className="story-success" role="status">
            <span aria-hidden="true">✓</span>
            <h2 id="story-dialog-title">Спасибо, что поделился</h2>
            <button ref={successCloseRef} type="button" onClick={closeAndReset}>Закрыть</button>
          </div>
        ) : (
          <>
            <h2 id="story-dialog-title">Рассказать о случае</h2>
            <form noValidate onSubmit={submit}>
              <div className="story-field">
                <label htmlFor="story-contact-method">Куда прислать ответ?</label>
                <select
                  id="story-contact-method"
                  ref={selectRef}
                  value={method}
                  required
                  aria-invalid={Boolean(errors.method)}
                  aria-describedby={errors.method ? "story-contact-method-error" : undefined}
                  onChange={(event) => changeMethod(event.target.value as ContactMethod)}
                >
                  <option value="">Выбери способ связи</option>
                  {Object.keys(contactField).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
                {errors.method && <p className="story-error" id="story-contact-method-error" role="alert" aria-label={errors.method}>{errors.method}</p>}
              </div>

              {method && (
                <div className="story-field">
                  <label htmlFor="story-contact">{contactField[method].label}</label>
                  <input
                    id="story-contact"
                    ref={contactRef}
                    type={contactField[method].type}
                    value={contact}
                    required
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? "story-contact-error" : undefined}
                    onChange={(event) => setContact(event.target.value)}
                  />
                  {errors.contact && <p className="story-error" id="story-contact-error" role="alert" aria-label={errors.contact}>{errors.contact}</p>}
                </div>
              )}

              <div className="story-field">
                <label htmlFor="story-text">Поделись своим случаем</label>
                <textarea
                  id="story-text"
                  ref={storyRef}
                  value={story}
                  required
                  aria-invalid={Boolean(errors.story)}
                  aria-describedby={errors.story ? "story-text-error" : undefined}
                  onChange={(event) => setStory(event.target.value)}
                />
                {errors.story && <p className="story-error" id="story-text-error" role="alert" aria-label={errors.story}>{errors.story}</p>}
              </div>
              <button type="submit">Рассказать</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

type FormErrors = Partial<Record<"method" | "contact" | "story", string>>;

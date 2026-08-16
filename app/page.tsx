"use client";

import { useEffect, useRef, useState } from "react";
import { StoryFormDialog } from "./components/StoryFormDialog";

type Question = {
  scene: string;
  icon: string;
  eyebrow: string;
  question: string;
  answers: string[];
  correct: number;
  explanation: string;
  rule: string;
};

const questions: Question[] = [
  {
    scene: "Чат · 22:47",
    icon: "📸",
    eyebrow: "Лёгкие деньги",
    question: "Незнакомец предлагает 5 000 ₽ за фото служебного входа и обещает полную анонимность. Что делать?",
    answers: [
      "Снять, если не заходить внутрь",
      "Уточнить, зачем ему фото",
      "Отказаться, сохранить переписку и рассказать взрослому",
    ],
    correct: 2,
    explanation: "Безобидное фото может быть первым заданием и способом проверить, готовы ли вы выполнять указания. Обещания анонимности — приманка.",
    rule: "Простое действие + необычно высокая оплата = стоп-сигнал.",
  },
  {
    scene: "Новый контакт",
    icon: "🎮",
    eyebrow: "Дружба в игре",
    question: "Игрок, с которым вы общаетесь три дня, зовёт в закрытый чат: «Там свои, никто не осудит». Ваш ход?",
    answers: [
      "Перейти, но ничего не писать",
      "Не переходить и проверить, кто этот человек",
      "Позвать с собой друга",
    ],
    correct: 1,
    explanation: "Вербовщики часто начинают с дружелюбного общения и постепенно уводят человека в закрытое пространство, где легче давить и изолировать.",
    rule: "Быстрое сближение и секретный чат — повод остановиться.",
  },
  {
    scene: "Закрытый канал",
    icon: "⚫",
    eyebrow: "Свои против чужих",
    question: "В канале постоянно пишут: «Все вокруг враги, только мы знаем правду». Как оценить это?",
    answers: [
      "Как сильный признак манипуляции",
      "Как обычный стиль общения",
      "Как доказательство правоты канала",
    ],
    correct: 0,
    explanation: "Деление мира на «своих» и «врагов» отключает критическое мышление. Так создают чувство исключительности и подталкивают к нужным действиям.",
    rule: "Тот, кто запрещает сомневаться, пытается управлять.",
  },
  {
    scene: "Подарок получен",
    icon: "🎁",
    eyebrow: "Услуга за услугу",
    question: "Он подарил подписку, а позже просит «маленькую ответную услугу» — передать пакет. Что безопаснее?",
    answers: [
      "Согласиться: вы теперь должны",
      "Передать, не заглядывая внутрь",
      "Отказаться: подарок не создаёт обязательств",
    ],
    correct: 2,
    explanation: "Подарок может создавать искусственное чувство долга. Вы не обязаны выполнять просьбы, особенно если содержание и цель скрывают.",
    rule: "Благодарность — не контракт и не повод рисковать.",
  },
  {
    scene: "Таймер · 09:58",
    icon: "⏱️",
    eyebrow: "Срочность",
    question: "Вас торопят: «Решай сейчас, через десять минут предложение сгорит». Что делать?",
    answers: [
      "Взять паузу и обсудить ситуацию с тем, кому доверяете",
      "Согласиться, чтобы не упустить шанс",
      "Попросить пять минут вместо десяти",
    ],
    correct: 0,
    explanation: "Искусственная срочность не даёт проверить факты и посоветоваться. Безопасное предложение выдерживает паузу и вопросы.",
    rule: "Когда вас торопят — замедлитесь.",
  },
  {
    scene: "Файл · bonus.apk",
    icon: "📲",
    eyebrow: "Секретное приложение",
    question: "Новый знакомый прислал приложение «для защищённой связи» и просит отключить проверку безопасности. Ваш ответ?",
    answers: [
      "Установить на старый телефон",
      "Не устанавливать, удалить файл и заблокировать отправителя",
      "Сначала спросить отзывы в чате",
    ],
    correct: 1,
    explanation: "Сторонний файл может красть переписки, фото, контакты и доступы. Просьба отключить защиту — отдельный красный флаг.",
    rule: "Защиту не отключают ради чужого удобства.",
  },
  {
    scene: "Личные данные",
    icon: "🪪",
    eyebrow: "Проверка личности",
    question: "Для «оформления выплаты» просят фото паспорта и селфи с ним. Как поступить?",
    answers: [
      "Отправить только страницу с фото",
      "Закрыть номер документа пальцем",
      "Не отправлять и проверить организацию через официальный канал",
    ],
    correct: 2,
    explanation: "Фото документов могут использовать для шантажа, мошенничества или оформления услуг на ваше имя. Проверяйте запрос независимо, а не по ссылке собеседника.",
    rule: "Документы и коды — не валюта доверия.",
  },
  {
    scene: "Сообщение удалено",
    icon: "🤐",
    eyebrow: "Только никому",
    question: "Собеседник говорит: «Родители не поймут. Удали переписку и никому не говори». Что это значит?",
    answers: [
      "Он заботится о вашей приватности",
      "Это попытка изолировать вас от помощи",
      "Так общаются все закрытые сообщества",
    ],
    correct: 1,
    explanation: "Требование хранить тайну от близких помогает манипулятору сохранить контроль. Надёжный взрослый или друг со стороны увидит то, что трудно заметить внутри ситуации.",
    rule: "Секрет, который пугает, нужно рассказать.",
  },
  {
    scene: "Переслано другом",
    icon: "🤝",
    eyebrow: "Знакомый источник",
    question: "Хороший знакомый пересылает вакансию: переводить деньги между картами за процент. Можно доверять?",
    answers: [
      "Да, знакомый бы не обманул",
      "Да, если суммы небольшие",
      "Нет: проверить условия и не участвовать в переводах чужих денег",
    ],
    correct: 2,
    explanation: "Знакомый сам может быть обманут или находиться под давлением. Перевод чужих денег через свою карту способен сделать вас участником преступной схемы.",
    rule: "Знакомый отправитель не делает опасную просьбу безопасной.",
  },
  {
    scene: "Голосовое · 0:18",
    icon: "⚠️",
    eyebrow: "Угроза",
    question: "После отказа вам угрожают опубликовать личные фото. Какой шаг верный?",
    answers: [
      "Выполнить одно последнее задание",
      "Не платить, сохранить доказательства и обратиться за помощью",
      "Удалить аккаунт и молчать",
    ],
    correct: 1,
    explanation: "Уступка редко прекращает шантаж — требования обычно растут. Важно не оставаться одному: сохраните сообщения, обратитесь к близкому взрослому и в полицию.",
    rule: "Шантаж теряет силу, когда о нём знают те, кто может помочь.",
  },
  {
    scene: "Точка на карте",
    icon: "📍",
    eyebrow: "Разведка понарошку",
    question: "Вас просят отметить на карте камеры у станции «для учебного проекта». Что настораживает больше всего?",
    answers: [
      "Задание связано с реальным объектом и сбором чувствительных данных",
      "В проекте нет красивой презентации",
      "За это не предлагают оплату",
    ],
    correct: 0,
    explanation: "Сбор данных о камерах, охране, служебных входах и инфраструктуре может быть частью подготовки преступления — даже если просьбу называют исследованием.",
    rule: "Сомнительное задание не становится безопасным из-за красивой легенды.",
  },
  {
    scene: "Что делать сейчас?",
    icon: "🛟",
    eyebrow: "Вы уже ответили",
    question: "Вы уже отправили фото и поняли, что вас втягивают. Как действовать?",
    answers: [
      "Продолжить, чтобы не разозлить куратора",
      "Стереть всё и надеяться, что забудут",
      "Прекратить контакт, сохранить доказательства и сразу обратиться за помощью",
    ],
    correct: 2,
    explanation: "Не продолжайте выполнять требования и не пытайтесь решить всё в одиночку. Сохраните переписку, данные аккаунта и расскажите близкому взрослому; при угрозе звоните 112 или 102.",
    rule: "Просить о помощи не поздно ни на каком этапе.",
  },
];

const partners = [
  {
    mark: "НАК",
    name: "Национальный антитеррористический комитет",
    copy: "Материалы о противодействии интернет-вербовке и алгоритмы безопасных действий.",
    href: "https://nac.gov.ru/",
    color: "blue",
  },
  {
    mark: "ЛБИ",
    name: "Лига безопасного интернета",
    copy: "Методические материалы для подростков, родителей и педагогов.",
    href: "https://ligainternet.ru/metodicheskie-materialy/",
    color: "lime",
  },
  {
    mark: "МВД",
    name: "МВД России",
    copy: "Официальная информация, контакты и приём обращений граждан.",
    href: "https://мвд.рф/",
    color: "orange",
  },
];

function getResult(score: number) {
  if (score === questions.length) {
    return {
      title: "Ты чемпион бдительности!",
      text: "Ты распознаёшь все основные уловки. Можешь помогать другим: поделись тестом и спокойно объясняй друзьям, где спрятана манипуляция.",
      icon: "🏆",
      tag: "Защитник команды",
    };
  }
  if (score >= 9) {
    return {
      title: "Твой радар работает точно",
      text: "Ты уверенно замечаешь угрозы. Осталось закрепить пару правил — и застать тебя врасплох будет очень трудно.",
      icon: "🛡️",
      tag: "Крепкая защита",
    };
  }
  if (score >= 6) {
    return {
      title: "База есть — усиливаем защиту",
      text: "Часть уловок ты видишь сразу, но давление, срочность или доверие к знакомым могут сбить с курса. Пересмотри разборы ошибок.",
      icon: "🧭",
      tag: "Внимательный исследователь",
    };
  }
  return {
    title: "Твой радар пора настроить",
    text: "Манипуляторы умеют выглядеть дружелюбно. Это поправимо: запомни три шага — пауза, проверка, разговор с тем, кому доверяешь.",
    icon: "🔦",
    tag: "Начало маршрута",
  };
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLElement>(null);

  const question = questions[current];
  const result = getResult(score);

  useEffect(() => {
    if (showModal) {
      dialogRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  function startQuiz() {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    window.setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function answer(index: number) {
    if (showModal) return;
    setSelected(index);
    if (index === question.correct) setScore((value) => value + 1);
    setShowModal(true);
  }

  function nextQuestion() {
    setShowModal(false);
    setSelected(null);
    if (current === questions.length - 1) {
      setFinished(true);
      window.setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      setCurrent((value) => value + 1);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Со мной не случится — на главную">
          <span className="brand-mark">↗</span>
          <span>СО МНОЙ НЕ СЛУЧИТСЯ</span>
        </a>
        <div className="header-actions">
          <button className="story-trigger header-story-trigger" onClick={() => setStoryDialogOpen(true)}>
            Рассказать о случае
          </button>
          <a className="header-link" href="#partners">Куда обратиться</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span>12 ситуаций</span> · 7 минут · без регистрации</p>
          <h1>Уверен, что с тобой<br /><em>такого не случится?</em></h1>
          <p className="hero-lead">Проверь, распознаешь ли ты давление, «лёгкие деньги» и опасные просьбы — до того, как они станут проблемой.</p>
          <button className="primary-button" onClick={startQuiz}>
            Начать проверку <span aria-hidden="true">→</span>
          </button>
          <p className="privacy-note"><span>●</span> Ответы никуда не отправляются</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="radar-card">
            <div className="radar-top"><span>РАДАР РИСКА</span><span>ONLINE</span></div>
            <div className="radar">
              <span className="radar-dot dot-one" />
              <span className="radar-dot dot-two" />
              <span className="radar-dot dot-three" />
              <div className="radar-sweep" />
              <div className="radar-center">?</div>
            </div>
            <div className="signal-row"><span>СИГНАЛЫ</span><strong>3</strong><span>НУЖНА ПРОВЕРКА</span></div>
          </div>
          <div className="floating-chip chip-one">СРОЧНО!</div>
          <div className="floating-chip chip-two">НИКОМУ НЕ ГОВОРИ</div>
          <div className="floating-chip chip-three">ЛЁГКИЕ ДЕНЬГИ</div>
        </div>
      </section>

      <section className="quiz-section" id="test" ref={quizRef}>
        <div className="section-heading">
          <p className="section-index">01 / ТЕСТ</p>
          <h2>Как сработает<br />твой внутренний радар?</h2>
        </div>

        {!started ? (
          <div className="quiz-intro">
            <div className="intro-number">12</div>
            <div>
              <h3>Реальные ситуации.<br />Один безопасный выбор.</h3>
              <p>После каждого ответа покажем разбор. Ошибаться здесь можно — именно так тренируется бдительность.</p>
              <button className="secondary-button" onClick={startQuiz}>Запустить тест <span>→</span></button>
            </div>
          </div>
        ) : finished ? (
          <div className="result-card" aria-live="polite">
            <div className="result-burst"><span>{result.icon}</span></div>
            <div className="result-content">
              <p className="result-tag">{result.tag}</p>
              <p className="score-line"><strong>{score}</strong><span>/ {questions.length}</span></p>
              <h3>{result.title}</h3>
              <p>{result.text}</p>
              <div className="result-actions">
                <button className="primary-button dark" onClick={startQuiz}>Пройти ещё раз</button>
                <a className="text-link" href="#partners">Изучить материалы <span>↓</span></a>
              </div>
            </div>
          </div>
        ) : (
          <div className="quiz-shell">
            <div className="quiz-status">
              <span>Ситуация {String(current + 1).padStart(2, "0")}</span>
              <span>{current + 1} / {questions.length}</span>
            </div>
            <div className="progress-track"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>

            <div className="scene-card">
              <div className="scene-grid" />
              <div className="scene-meta"><span>{question.scene}</span><span>● SIGNAL</span></div>
              <div className="scene-icon">{question.icon}</div>
              <div className="scene-wave"><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="scene-caption">{question.eyebrow}</div>
            </div>

            <div className="question-body">
              <p className="question-eyebrow">Выбери один ответ</p>
              <h3>{question.question}</h3>
              <div className="answers">
                {question.answers.map((answerText, index) => (
                  <button key={answerText} onClick={() => answer(index)} disabled={showModal}>
                    <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                    <span>{answerText}</span>
                    <span className="answer-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="help-strip">
        <div>
          <span className="help-icon">!</span>
          <p><strong>Если опасность реальна прямо сейчас</strong><br />Не оставайся один и звони 112 или 102.</p>
        </div>
        <span className="help-arrow">→</span>
      </section>

      <section className="partners-section" id="partners">
        <div className="section-heading partners-heading">
          <p className="section-index">02 / ПОЛЕЗНЫЕ РЕСУРСЫ</p>
          <h2>Знать больше.<br />Помогать точнее.</h2>
          <p>Официальные материалы о безопасности, профилактике вовлечения и способах обратиться за помощью.</p>
        </div>
        <div className="partner-grid">
          {partners.map((partner) => (
            <a className="partner-card" href={partner.href} target="_blank" rel="noreferrer" key={partner.name}>
              <div className={`partner-mark ${partner.color}`}>{partner.mark}</div>
              <span className="external">↗</span>
              <h3>{partner.name}</h3>
              <p>{partner.copy}</p>
              <span className="partner-link">Открыть проект</span>
            </a>
          ))}
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">↗</span><span>СО МНОЙ НЕ СЛУЧИТСЯ</span></a>
        <p>Учебный тест. Он не заменяет консультацию специалистов или обращение в экстренные службы.</p>
        <div className="footer-actions">
          <button className="story-trigger footer-story-trigger" onClick={() => setStoryDialogOpen(true)}>
            Рассказать о случае
          </button>
          <a href="#top">Наверх ↑</a>
        </div>
      </footer>

      <StoryFormDialog
        isOpen={storyDialogOpen}
        onClose={() => setStoryDialogOpen(false)}
      />

      {showModal && selected !== null && (
        <div className="modal-backdrop" role="presentation">
          <div className={`answer-modal ${selected === question.correct ? "correct" : "incorrect"}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef}>
            <div className="modal-result-icon">{selected === question.correct ? "✓" : "×"}</div>
            <p className="modal-kicker">{selected === question.correct ? "Точно! +1 балл" : "Не лучший выбор"}</p>
            <h3 id="modal-title">{selected === question.correct ? "Радар сработал" : "Вот где спрятан крючок"}</h3>
            {selected !== question.correct && (
              <div className="right-answer"><span>Правильный ответ</span>{question.answers[question.correct]}</div>
            )}
            <p className="modal-explanation">{question.explanation}</p>
            <div className="rule-card"><span>Запомни</span><strong>{question.rule}</strong></div>
            <button className="modal-button" onClick={nextQuestion}>
              {current === questions.length - 1 ? "Узнать результат" : "Следующая ситуация"} <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

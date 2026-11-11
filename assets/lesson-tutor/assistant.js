import { AI_ENABLED } from './config.js';
import {
  MAX_QUESTION_LENGTH, SUGGESTIONS, asksAboutGraph, blockedReason, cleanQuestion, getContext, isInScope,
  isLessonLink, matchQuestion, preparedAnswer, readGraphSelection, slugFromPath,
} from './core.js';

const AI_PATH = '/api/lesson-tutor';
const NO_AI = 'AI help is unavailable right now. You can still use all the prepared answers and lesson examples.';
const UNSAFE = 'Powered amplifiers and mains circuits can be dangerous. Have a qualified technician handle internal testing or repairs.';
const OFF_TOPIC = 'Try a question about this lesson, its examples or a closely related audio topic.';
let bankRequest;

function loadBank() {
  bankRequest ??= fetch('/assets/lesson-tutor/approved-answers.json')
    .then(response => {
      if (!response.ok) throw new Error('Answer bank unavailable');
      return response.json();
    })
    .catch(error => {
      bankRequest = undefined;
      throw error;
    });
  return bankRequest;
}

export function mountLessonTutor() {
  const slug = slugFromPath(location.pathname);
  const hero = document.querySelector('.dl-lesson-top');
  const main = hero?.closest('main');
  if (!slug || !main || hero.querySelector('.lesson-tutor')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/assets/lesson-tutor/assistant.css';
  document.head.append(stylesheet);

  const panel = document.createElement('details');
  panel.className = 'lesson-tutor';
  panel.id = 'ask-the-sound-question';
  panel.innerHTML = [
    '<summary>Ask The Sound Question</summary>',
    '<div class="lesson-tutor-body">',
    '  <p class="lesson-tutor-context" hidden></p>',
    '  <div class="lesson-tutor-controls" hidden>',
    '    <div class="lesson-tutor-suggestions" role="group" aria-label="Suggested questions"></div>',
    '    <form class="lesson-tutor-form">',
    '      <label for="lesson-tutor-question">Your question about this lesson</label>',
    '      <div class="lesson-tutor-input">',
    '        <input id="lesson-tutor-question" name="question" type="text" required autocomplete="off">',
    '        <button type="submit">Find an answer</button>',
    '      </div>',
    '    </form>',
    '  </div>',
    '  <p class="lesson-tutor-status" role="status"></p>',
    '  <button class="lesson-tutor-ai" type="button" hidden>Ask AI for this question</button>',
    '  <div class="lesson-tutor-answer" role="region" aria-labelledby="lesson-tutor-answer-title" tabindex="-1" hidden>',
    '    <h3 id="lesson-tutor-answer-title"></h3><p></p>',
    '    <a>Show me where this is explained</a>',
    '  </div>',
    '  <button class="lesson-tutor-follow" type="button" hidden>Ask one clarification</button>',
    '</div>',
  ].join('\n');
  hero.append(panel);

  const summary = panel.querySelector('summary');
  const status = panel.querySelector('.lesson-tutor-status');
  const contextLine = panel.querySelector('.lesson-tutor-context');
  const controls = panel.querySelector('.lesson-tutor-controls');
  const suggestions = panel.querySelector('.lesson-tutor-suggestions');
  const form = panel.querySelector('form');
  const input = form.querySelector('input');
  const submit = form.querySelector('button');
  const aiButton = panel.querySelector('.lesson-tutor-ai');
  const followButton = panel.querySelector('.lesson-tutor-follow');
  const answerBox = panel.querySelector('.lesson-tutor-answer');
  const heading = answerBox.querySelector('h3');
  const answerText = answerBox.querySelector('p');
  const answerLink = answerBox.querySelector('a');
  const figures = [...main.querySelectorAll('[data-lesson-plot]')];
  input.maxLength = MAX_QUESTION_LENGTH;

  let figure = figures[0] ?? null;
  let section = null;
  let bank;
  let pending;
  let activeAi = false;
  let clarification;
  let shownGraph;
  let version = 0;

  function context() {
    return getContext(bank, { lesson: slug, section, ...readGraphSelection(figure) });
  }

  function clearPending() {
    pending = null;
    aiButton.hidden = true;
  }

  function resetClarification() {
    clarification = null;
    followButton.hidden = true;
    submit.textContent = 'Find an answer';
  }

  function showAnswer(answer, source, moveFocus = true) {
    answerBox.hidden = false;
    heading.textContent = source;
    answerText.textContent = answer.text;
    answerLink.hidden = !isLessonLink(answer.href);
    if (!answerLink.hidden) answerLink.href = answer.href;
    if (moveFocus) answerBox.focus();
  }

  const chips = new Map(SUGGESTIONS.map(({ id, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => showPrepared(id));
    suggestions.append(button);
    return [id, button];
  }));

  function renderContext() {
    const current = context();
    if (!current) return;
    contextLine.textContent = current.lesson.title + (current.example ? ' · ' + current.example.label : '');
    contextLine.hidden = false;
    const graphChip = chips.get('graph');
    graphChip.hidden = !current.example;
    if (current.example) graphChip.textContent = 'Explain “' + current.example.label + '”';
  }

  function showPrepared(id, moveFocus = true) {
    const answer = preparedAnswer(context(), id);
    if (!answer) return;
    version += 1;
    clearPending();
    resetClarification();
    status.textContent = '';
    shownGraph = answer.usesGraph ? { id } : null;
    showAnswer(answer, 'Prepared lesson answer', moveFocus);
  }

  function switchContext(nextFigure, nextSection) {
    figure = nextFigure;
    section = nextSection;
    if (!bank) return;
    version += 1;
    if (pending || activeAi || clarification) status.textContent = '';
    clearPending();
    resetClarification();
    renderContext();
    if (shownGraph) {
      const answer = shownGraph.question
        ? matchQuestion(context(), shownGraph.question)
        : preparedAnswer(context(), shownGraph.id);
      if (answer) showAnswer(answer, 'Prepared lesson answer', false);
      else answerBox.hidden = true;
    } else if (heading.textContent === 'AI lesson answer') {
      answerBox.hidden = true;
    }
  }

  function syncHash() {
    const target = document.getElementById(location.hash.slice(1));
    const nextSection = target && main.contains(target) && target !== panel ? target.id : null;
    const nextFigure = target?.matches('[data-lesson-plot]')
      ? target : target?.querySelector('[data-lesson-plot]');
    if (nextSection !== section || (nextFigure && nextFigure !== figure)) {
      switchContext(nextFigure || figure, nextSection);
    }
  }

  async function ensureBank() {
    if (bank) return true;
    status.textContent = 'Loading prepared answers…';
    try {
      const loaded = await loadBank();
      if (!Object.hasOwn(loaded, slug)) throw new Error('Lesson unavailable');
      bank = loaded;
      renderContext();
      controls.hidden = false;
      status.textContent = '';
      return true;
    } catch {
      status.textContent = 'The prepared answers could not load. Reopen this panel to try again.';
      return false;
    }
  }

  panel.addEventListener('toggle', () => {
    if (panel.open) ensureBank();
  });

  main.addEventListener('click', event => {
    const option = event.target.closest('button[data-select-case]');
    const selected = option?.closest('[data-lesson-plot]');
    if (selected) switchContext(selected, selected.closest('section[id]')?.id ?? null);
  });

  window.addEventListener('hashchange', syncHash);
  syncHash();

  for (const plot of figures) {
    const shortcut = document.createElement('button');
    shortcut.className = 'lesson-tutor-shortcut';
    shortcut.type = 'button';
    shortcut.textContent = 'Ask about this example';
    shortcut.setAttribute('aria-controls', panel.id);
    shortcut.addEventListener('click', async () => {
      switchContext(plot, plot.closest('section[id]')?.id ?? null);
      panel.open = true;
      summary.focus();
      if (await ensureBank()) showPrepared('graph');
    });
    plot.after(shortcut);
  }

  input.addEventListener('input', () => {
    if (pending) {
      clearPending();
      status.textContent = '';
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    version += 1;
    clearPending();
    const question = cleanQuestion(input.value);
    if (!question) {
      status.textContent = 'Enter one short question about the lesson.';
      return;
    }
    const current = context();
    const answer = matchQuestion(current, question);
    if (answer) {
      resetClarification();
      shownGraph = answer.usesGraph ? { question } : null;
      status.textContent = '';
      showAnswer(answer, 'Prepared lesson answer');
      return;
    }
    answerBox.hidden = true;
    shownGraph = null;
    followButton.hidden = true;
    if (blockedReason(question) === 'safety') {
      status.textContent = UNSAFE;
    } else if (!blockedReason(question) && !current.example && asksAboutGraph(question)) {
      status.textContent = 'Choose a graph example in the lesson, then use “Ask about this example.”';
    } else if (!isInScope(bank, current, question, Boolean(clarification))) {
      status.textContent = OFF_TOPIC;
    } else if (!AI_ENABLED) {
      status.textContent = 'There is no prepared answer for that wording. Try a suggested question above or use the lesson links.';
    } else if (activeAi) {
      status.textContent = 'An AI answer is still loading. You can use the prepared answers in the meantime.';
    } else {
      pending = {
        question, lesson: slug, section: current.section,
        plot: current.plotId, example: current.exampleId, followUp: clarification,
      };
      aiButton.hidden = false;
      status.textContent = 'There is no prepared answer for this question. Ask AI sends your question to Cloudflare Workers AI for a short lesson explanation.';
    }
  });

  aiButton.addEventListener('click', async () => {
    if (!pending || activeAi) return;
    const payload = pending;
    const attempt = ++version;
    clearPending();
    resetClarification();
    activeAi = true;
    status.textContent = 'Looking for an explanation…';
    try {
      const response = await fetch(AI_PATH, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
      });
      const result = await response.json();
      if (attempt !== version) return;
      if (result.kind === 'answer' && typeof result.text === 'string') {
        status.textContent = '';
        const source = result.source === 'prepared' ? 'Prepared lesson answer' : 'AI lesson answer';
        showAnswer(result, source, panel.open);
        if (typeof result.followUp === 'string') {
          followButton.hidden = false;
          followButton.onclick = () => {
            clarification = result.followUp;
            followButton.hidden = true;
            submit.textContent = 'Find clarification';
            input.value = '';
            input.focus();
            status.textContent = 'Ask one short clarification about this answer.';
          };
        }
      } else {
        status.textContent = typeof result.message === 'string' ? result.message : NO_AI;
      }
    } catch {
      if (attempt === version) status.textContent = NO_AI;
    } finally {
      activeAi = false;
    }
  });
}

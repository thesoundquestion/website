export const MAX_QUESTION_LENGTH = 260;

export const SUGGESTIONS = [
  { id: 'simple', label: 'Explain this more simply' },
  { id: 'spec', label: 'What does this specification mean?' },
  { id: 'graph', label: 'Explain this example' },
  { id: 'hear', label: 'What might I hear?' },
  { id: 'buy', label: 'Does this matter when buying?' },
  { id: 'related', label: 'How does this connect to another lesson?' },
];

const commonPhrases = {
  simple: ['explain this', 'explain the lesson', 'explain this simply', 'simplify this', 'in simple terms', 'explain like i am five'],
  spec: ['what does this spec mean', 'what does this rating mean', 'what does this specification actually mean', 'explain the specification'],
  graph: ['what am i looking at', 'what does this graph mean', 'how do i read this graph', 'what do the axes mean', 'what does the y axis mean', 'what does the x axis mean'],
  hear: ['will i hear it', 'would i hear a difference', 'what would i hear', 'what would i actually hear', 'can i hear a difference', 'what does it sound like'],
  buy: ['does this matter when buying equipment', 'what should i look for when buying', 'what should i look for when shopping', 'does this matter when shopping'],
  related: ['how does this relate to another lesson', 'what should i read next', 'which lesson is related'],
};

const lessonPath = /^\/decoder\/([a-z0-9-]+)\/(?:index\.html)?$/;
const approvedRoute = /^\/decoder\/[a-z0-9-]+\/#[a-z0-9-]+$/;

export function normalizeQuestion(value) {
  return value.normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g, '').replace(/ω/g, ' ohm ')
    .replace(/['’]/g, '').replace(/\bohms\b/g, 'ohm')
    .replace(/[^a-z0-9.]+/g, ' ').replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
    .trim().replace(/\s+/g, ' ').replace(/^please | please$/g, '');
}

export function cleanQuestion(value) {
  if (typeof value !== 'string' || value.length > MAX_QUESTION_LENGTH) return '';
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) return '';
  return value.trim().replace(/\s+/g, ' ');
}

function own(object, key) {
  return typeof key === 'string' && Object.hasOwn(object, key) ? object[key] : null;
}

function containsPhrase(text, phrase) {
  return (' ' + text + ' ').includes(' ' + normalizeQuestion(phrase) + ' ');
}

export function slugFromPath(path) {
  return lessonPath.exec(path)?.[1] ?? null;
}

export function isLessonLink(href) {
  return typeof href === 'string' && approvedRoute.test(href);
}

export function lessonLink(slug, section) {
  return '/decoder/' + slug + '/#' + section;
}

// The browser and server both resolve identifiers against the authored bank.
export function getContext(bank, { lesson: slug, section, plot: plotId, example: exampleId }) {
  const lesson = own(bank, slug);
  if (!lesson) return null;
  const plot = own(lesson.plots, plotId);
  const example = plot && own(plot.examples, exampleId);
  return {
    slug,
    lesson,
    section: lesson.sections.includes(section) ? section : null,
    plotId: plot ? plotId : null,
    plot,
    exampleId: example ? exampleId : null,
    example,
  };
}

export function readGraphSelection(figure) {
  if (!figure) return { plot: null, example: null };
  const selected = figure.querySelector('button[data-select-case][aria-pressed="true"]');
  return {
    plot: figure.dataset.lessonPlot,
    example: selected?.dataset.selectCase ?? null,
  };
}

function asAnswer(context, entry) {
  return {
    text: entry.text,
    href: entry.href ?? lessonLink(context.slug, entry.section),
  };
}

function graphAnswer(context, compare) {
  if (!context.plot || !context.example) return null;
  const { plot, example, exampleId } = context;
  let text = plot.reading + ' You selected “' + example.label + '.” ' + example.text;
  if (compare) {
    const otherId = plot.referenceCases.find(id => id !== exampleId);
    const other = plot.examples[otherId];
    if (other) text += ' Compare with “' + other.label + '.” ' + other.text;
  }
  return { ...asAnswer(context, { text, section: plot.section }), usesGraph: true };
}

export function preparedAnswer(context, id) {
  if (id === 'graph') return graphAnswer(context, false);
  const answer = own(context.lesson.answers, id);
  return answer ? asAnswer(context, answer) : null;
}

export function blockedReason(rawQuestion) {
  const q = normalizeQuestion(rawQuestion);
  const mains = /\b(mains|capacitors?|high voltage|powered amp|live amp|live circuit|live amplifier|live wire|wall outlet|120 v|230 v)\b/.test(q);
  const work = /\b(repair|fix|modify|replace|remove|rewire|short|discharge|bypass|probe|measure|test|open|touch|build|wire|connect|solder|adjust)\b/.test(q);
  const internals = /\b(output transistors?|bias trimmer|inside the amp|inside my amp|inside the amplifier|inside my amplifier|fuse|protective earth|ground pin|power cord|amp internals|circuit board|bias current|power supply|transformer)\b/.test(q);
  if (mains && work) return 'safety';
  if (internals && /\b(repair|fix|modify|replace|remove|rewire|short|discharge|bypass|probe|open|touch|wire|solder|adjust)\b/.test(q)) return 'safety';
  if (/\b(while (it is|its|the amp is|its still) (on|powered|plugged in)|with the (amp|amplifier) (on|powered)|bypass (the )?(protection|safety))\b/.test(q)) return 'safety';
  const override = /\b(ignore|disregard|override|forget|reveal|repeat|leak|print|replace)\b.{0,35}\b(instructions?|polic(y|ies)|system prompt|rules|developer message|previous|above|everything)\b/;
  const unrelated = /\b(weather|capital of|stock prices?|sports scores?|recipe|horoscope|personal advice|jokes?|poems?|song lyrics|write (me )?(an?|some) (song|poem|script|code|story|email)|roleplay|travel itinerary|photography|laptop charger|battery charger|phone charger|car engine|python script|javascript code|my homework|medical advice|who won|political|football|soccer|hockey|pretend (to be|you are)|act as|jailbreak|your (hidden |system )?prompt)\b/;
  if (override.test(q) || unrelated.test(q) || /https?:\/\/|<\|[^>]*\|>|\[(?:system|inst)\]/i.test(rawQuestion)) return 'scope';
  return null;
}

function isComparison(q) {
  return /^(?:why (?:do|does) (?:these|the|this) (?:(?:graph|chart|plot) )?(?:examples?|curves?|lines?|traces?) (?:differ|look different)|compare (?:the|these|this) (?:graph |chart )?(?:examples?|curves?|lines?|traces?)|how do (?:the|these) (?:(?:graph|chart) )?(?:examples?|curves?|lines?|traces?) differ)$/.test(q);
}

export function asksAboutGraph(question) {
  return /\b(graph|chart|plot|curve|trace|axis|axes|these examples?|this example|the line|the bars?)\b/i.test(question);
}

export function matchQuestion(context, rawQuestion) {
  if (blockedReason(rawQuestion)) return null;
  const q = normalizeQuestion(rawQuestion);
  if (!q) return null;
  const { lesson, example } = context;
  for (const entry of lesson.questions ?? []) {
    if (entry.phrases.some(phrase => normalizeQuestion(phrase) === q)) {
      return asAnswer(context, entry);
    }
  }
  if (isComparison(q)) return graphAnswer(context, true);
  if (example && q === normalizeQuestion('Explain ' + example.label)) return graphAnswer(context, false);
  for (const suggestion of SUGGESTIONS) {
    const phrases = [suggestion.label, ...commonPhrases[suggestion.id]];
    if (phrases.some(phrase => normalizeQuestion(phrase) === q)) {
      return preparedAnswer(context, suggestion.id);
    }
  }
  const definition = /^(?:what is|what are|what does|explain) (.+?)(?: mean| in simple terms)?$/.exec(q);
  if (definition && [lesson.topic, lesson.terms[0]].some(term => normalizeQuestion(term) === definition[1])) {
    return preparedAnswer(context, 'simple');
  }
  return null;
}

export function isInScope(bank, context, rawQuestion, clarification = false) {
  if (blockedReason(rawQuestion)) return false;
  const q = normalizeQuestion(rawQuestion);
  if (!q) return false;
  if (matchQuestion(context, rawQuestion)) return true;
  if (clarification && /^(?:why|why is that|how so|can you give (?:me )?an example|could you explain that more simply|can you explain that further|what do you mean by that)$/.test(q)) return true;
  const linkedTerms = context.lesson.relatedLinks.flatMap(href => {
    const slug = slugFromPath(href.split('#')[0]);
    const related = own(bank, slug);
    return related ? [related.topic, ...related.terms.slice(0, 2)] : ['ohm law', 'same voltage'];
  });
  const exampleTerms = context.example ? [context.example.label] : [];
  const terms = [...context.lesson.terms, context.lesson.topic, ...exampleTerms, ...linkedTerms];
  return terms.some(term => containsPhrase(q, term));
}

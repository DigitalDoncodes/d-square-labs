import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wind, Brain, Lightbulb, Sunrise, HeartHandshake, PenSquare, ArrowRight, Phone,
} from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page } from '../../components/common/motion';

// ── Guided breathing ─────────────────────────────────────────────────────────
// Phases cycle continuously; the circle scales with a CSS transition matched
// to each phase's duration, so the animation itself paces the breath.
const PATTERNS = {
  box: {
    label: 'Box breathing',
    hint: 'Steadies nerves before a presentation or interview.',
    phases: [
      { name: 'Breathe in', secs: 4, scale: 1 },
      { name: 'Hold', secs: 4, scale: 1 },
      { name: 'Breathe out', secs: 4, scale: 0.55 },
      { name: 'Hold', secs: 4, scale: 0.55 },
    ],
  },
  relax: {
    label: '4-7-8 relax',
    hint: 'Winds the body down — useful before sleep or after a stressful day.',
    phases: [
      { name: 'Breathe in', secs: 4, scale: 1 },
      { name: 'Hold', secs: 7, scale: 1 },
      { name: 'Breathe out slowly', secs: 8, scale: 0.55 },
    ],
  },
  sigh: {
    label: 'Calming sigh',
    hint: 'The fastest reset — two short inhales, one long exhale.',
    phases: [
      { name: 'Breathe in', secs: 2, scale: 0.85 },
      { name: 'Top-up breath', secs: 1, scale: 1 },
      { name: 'Long exhale', secs: 6, scale: 0.55 },
    ],
  },
};

function BreathingExercise() {
  const [patternKey, setPatternKey] = useState('box');
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timerRef = useRef(null);

  const pattern = PATTERNS[patternKey];
  const phase = pattern.phases[phaseIdx];

  useEffect(() => {
    if (!running) return undefined;
    timerRef.current = setTimeout(
      () => setPhaseIdx((i) => (i + 1) % pattern.phases.length),
      phase.secs * 1000
    );
    return () => clearTimeout(timerRef.current);
  }, [running, phaseIdx, pattern, phase.secs]);

  const start = () => { setPhaseIdx(0); setRunning(true); };
  const stop = () => { setRunning(false); setPhaseIdx(0); };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Wind className="h-4 w-4 text-sky-500" /> Take a breath
        </h2>
        <div className="flex gap-1.5">
          {Object.entries(PATTERNS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => { setPatternKey(key); stop(); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                patternKey === key
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-6 text-center text-xs text-gray-500 dark:text-gray-400">{pattern.hint}</p>

      <div className="flex flex-col items-center">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-sky-100 dark:bg-sky-900/30"
            style={{
              transform: `scale(${running ? phase.scale : 0.7})`,
              transition: `transform ${running ? phase.secs : 0.6}s ease-in-out`,
            }}
          />
          <p className="relative z-10 text-sm font-medium text-sky-700 dark:text-sky-300">
            {running ? phase.name : 'Ready when you are'}
          </p>
        </div>
        <button
          onClick={running ? stop : start}
          className={`mt-5 rounded-xl px-6 py-2 text-sm font-medium transition-colors ${
            running
              ? 'border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
              : 'bg-sky-600 text-white hover:bg-sky-700'
          }`}
        >
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
}

// ── Techniques ───────────────────────────────────────────────────────────────
const STUDY_TECHNIQUES = [
  {
    title: 'Active recall',
    body: 'Close the book and write everything you remember, then check. Retrieval — not re-reading — is what builds memory.',
  },
  {
    title: 'Spaced repetition',
    body: 'Review a topic after 1 day, 3 days, then a week. Each spaced review roughly doubles how long it sticks.',
  },
  {
    title: 'The Feynman method',
    body: 'Explain the concept out loud as if teaching a junior. Wherever you stumble is exactly what you don’t yet understand.',
  },
  {
    title: 'One-topic focus blocks',
    body: 'One subject, 25–45 minutes, phone in another room. Try the timer on the Focus page.',
    link: { to: '/study/focus', label: 'Open Focus' },
  },
];

const MEMORY_TECHNIQUES = [
  {
    title: 'Chunking',
    body: 'Group long material into 3–5 item chunks. Frameworks like 4P or SWOT persist because they are pre-chunked.',
  },
  {
    title: 'Memory palace',
    body: 'Place items along a route you know well — your walk to class — and retrieve them by walking it mentally.',
  },
  {
    title: 'Make it weird',
    body: 'The brain keeps what is vivid and strange. An absurd mental image beats a neat, forgettable summary.',
  },
];

const ROUTINES = [
  { title: 'Sleep is study time', body: 'Memory consolidates during sleep. Six hours before an exam beats two more hours of blurry revision.' },
  { title: 'Daylight before screens', body: 'Five minutes of morning daylight anchors your body clock and steadies energy all day.' },
  { title: 'Move between classes', body: 'A ten-minute walk resets attention better than scrolling. Use it before the subject you dread.' },
  { title: 'One win before bed', body: 'Write down one thing you did today — however small. Your journal is built for this.', link: { to: '/me/journal', label: 'Open Journal' } },
];

function TechniqueSection({ icon: Icon, iconClass, title, items }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-gray-800/80 dark:bg-gray-900">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Icon className={`h-4 w-4 ${iconClass}`} /> {title}
      </h2>
      <ul className="space-y-4">
        {items.map((t) => (
          <li key={t.title}>
            <p className="text-sm font-medium">{t.title}</p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t.body}</p>
            {t.link && (
              <Link
                to={t.link.to}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                {t.link.label} <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function WellbeingPage() {
  useDocumentTitle('Wellbeing');
  return (
    <Page>
      <div className="mb-5">
        <h1 className="text-xl font-bold">Breathing</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The fastest reset — pick a pattern and follow the circle.
        </p>
      </div>
      <BreathingExercise />
    </Page>
  );
}

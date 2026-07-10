// Auto-generate a per-item trivia quiz from the archive item's own data —
// quotes, characters, villains, release year and studio. Deterministic-ish,
// no AI key needed; every cartoon gets unique questions.

const DECOY_STUDIOS = [
  'Cartoon Network Studios',
  'Nickelodeon Animation Studio',
  'Toei Animation',
  'Hanna-Barbera',
  'Disney Television Animation',
  'Green Gold Animations',
  'Xilam Animation',
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Build a question with shuffled options and the correct index tracked.
const question = (text, correctAnswer, decoys) => {
  const options = shuffle([correctAnswer, ...decoys.slice(0, 3)]);
  return { question: text, options, correct: options.indexOf(correctAnswer) };
};

export function buildTrivia(item) {
  if (!item) return [];
  const questions = [];

  const characterNames = (item.mainCharacters || []).map((c) => c.name).filter(Boolean);
  const villainNames = (item.villains || []).map((v) => v.name).filter(Boolean);
  const allNames = [...characterNames, ...villainNames];

  // 1. Who said this quote?
  for (const q of (item.iconicQuotes || []).slice(0, 2)) {
    if (!q.quote || !q.character) continue;
    const decoys = allNames.filter((n) => n !== q.character);
    if (decoys.length >= 2) {
      questions.push(question(`Who said: “${q.quote}”?`, q.character, shuffle(decoys)));
    }
  }

  // 2. Release year (with plausible nearby decoys).
  if (item.releaseYear) {
    const y = item.releaseYear;
    questions.push(
      question(`Which year did ${item.title} first release?`, String(y), [
        String(y + 3),
        String(y - 2),
        String(y + 7),
      ])
    );
  }

  // 3. Studio.
  if (item.studio) {
    const decoys = shuffle(DECOY_STUDIOS.filter((s) => !item.studio.includes(s)));
    questions.push(question(`Which studio made ${item.title}?`, item.studio, decoys));
  }

  // 4. Spot the villain.
  if (villainNames.length > 0 && characterNames.length >= 3) {
    questions.push(
      question(
        `Which of these is a villain in ${item.title}?`,
        villainNames[0],
        shuffle(characterNames)
      )
    );
  }

  return shuffle(questions).slice(0, 5);
}

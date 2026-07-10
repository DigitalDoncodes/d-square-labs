import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RotateCcw } from 'lucide-react';

export default function TriviaQuiz({ questions = [], title = 'Nostalgia trivia' }) {
  const quizList =
    questions && questions.length > 0
      ? questions
      : [
          {
            question: 'In the 1940 pilot episode, what was Tom originally named?',
            options: ['Jasper', 'Thomas', 'Sylvester', 'Felix'],
            correct: 0,
          },
          {
            question: 'What powers Chhota Bheem whenever he eats it?',
            options: ['Jalebi', 'Laddu', 'Halwa', 'Barfi'],
            correct: 1,
          },
        ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === quizList[currentIdx].correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentIdx + 1 < quizList.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowResults(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <HelpCircle className="h-4 w-4 text-indigo-500" /> {title}
        </h3>
        {!showResults && (
          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {currentIdx + 1} / {quizList.length}
          </span>
        )}
      </div>

      {!showResults ? (
        <div className="space-y-3">
          <p className="text-sm font-medium leading-relaxed">{quizList[currentIdx].question}</p>

          <div className="space-y-2 pt-1">
            {quizList[currentIdx].options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === quizList[currentIdx].correct;
              let btnStyle =
                'border-gray-200 text-gray-600 hover:border-indigo-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-700';

              if (selectedOption !== null) {
                if (isCorrect)
                  btnStyle =
                    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
                else if (isSelected)
                  btnStyle =
                    'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelect(idx)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition-colors ${btnStyle}`}
                >
                  <span>{option}</span>
                  {selectedOption !== null && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                  {selectedOption !== null && isSelected && !isCorrect && (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <button
              onClick={handleNext}
              className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {currentIdx + 1 === quizList.length ? 'See final score' : 'Next question'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Quiz completed!</h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              You scored <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}</span> out of {quizList.length}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      )}
    </div>
  );
}

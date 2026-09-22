import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, HelpCircle, RotateCcw, Award, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizInterface({ mcqSet, onGenerate, loading }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);

  const questions = mcqSet?.questions || [];

  const handleSelect = (qIdx, optionLetter) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optionLetter
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    if (score >= Math.ceil(questions.length * 0.7)) {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-700">Generating MCQs from your notes with Groq...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto text-center space-y-6">
        <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">Generate Practice MCQs</h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose your quiz parameters to generate realistic test questions based directly on this document.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Number of Questions
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value={3}>3 Questions (Quick)</option>
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (In-depth)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="easy">Easy (Definitions & Facts)</option>
              <option value="medium">Medium (Concepts & Logic)</option>
              <option value="hard">Hard (Application & Edge Cases)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onGenerate({ count, difficulty })}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate MCQ Quiz
        </button>
      </div>
    );
  }

  // Calculate score if submitted
  const score = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Banner / Scoreboard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">
            Practice Quiz ({questions.length} Questions • {mcqSet.difficulty?.toUpperCase()})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {submitted
              ? `Completed! You scored ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`
              : 'Select one answer for each question and submit.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {submitted ? (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              Submit Quiz
            </button>
          )}

          <button
            onClick={() => onGenerate({ count: 5, difficulty: 'medium' })}
            className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            title="Generate New Quiz"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const userAnswer = selectedAnswers[qIdx];
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <div
              key={qIdx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {qIdx + 1}
                </span>
                <p className="font-semibold text-slate-800 text-sm leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIdx) => {
                  // Extract letter A, B, C, D
                  const letter = opt.trim().charAt(0);
                  const isSelected = userAnswer === letter;

                  let optionStyles = 'border-slate-200 hover:border-brand-300 hover:bg-slate-50';

                  if (submitted) {
                    if (letter === q.correctAnswer) {
                      optionStyles = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                    } else if (isSelected && !isCorrect) {
                      optionStyles = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
                    } else {
                      optionStyles = 'border-slate-200 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyles = 'border-brand-600 bg-brand-50 text-brand-900 font-medium ring-1 ring-brand-600';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, letter)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${optionStyles}`}
                    >
                      <span>{opt}</span>
                      {submitted && letter === q.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation on submit */}
              {submitted && q.explanation && (
                <div className="mt-3 ml-9 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

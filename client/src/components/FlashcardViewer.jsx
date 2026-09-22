import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight, Sparkles, Check, Bookmark, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardViewer({ flashcards = [], onGenerate, loading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState({});

  const cards = flashcards?.cards || [];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleMastered = (idx) => {
    const nextState = !mastered[idx];
    setMastered(prev => ({ ...prev, [idx]: nextState }));
    if (nextState) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-slate-700">Synthesizing flashcards with AI...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Flashcards Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Generate interactive flashcards from this document to test your memory and study key definitions.
        </p>
        <button
          onClick={onGenerate}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Flashcards
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isCardMastered = !!mastered[currentIndex];

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between w-full max-w-xl px-2">
        <div className="text-xs font-semibold text-slate-500">
          Card {currentIndex + 1} of {cards.length}
        </div>
        <button
          onClick={onGenerate}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Regenerate New Set
        </button>
      </div>

      {/* 3D Flashcard Container */}
      <div
        className="w-full max-w-xl h-72 cursor-pointer perspective-1000 select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front (Question) */}
          <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-slate-200 p-8 flex flex-col justify-between shadow-md backface-hidden hover:border-brand-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Question / Concept</span>
              <span className="flex items-center gap-1 text-brand-600">
                <RotateCw className="w-3.5 h-3.5" /> Click to Flip
              </span>
            </div>

            <div className="text-center my-auto px-4">
              <p className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                {currentCard.question}
              </p>
            </div>

            <div className="text-center text-xs text-slate-400">
              Front side
            </div>
          </div>

          {/* Back (Answer) */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-brand-600 to-indigo-700 text-white rounded-3xl p-8 flex flex-col justify-between shadow-lg rotate-y-180 backface-hidden">
            <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold uppercase tracking-wider">
              <span>Answer / Definition</span>
              <span className="flex items-center gap-1 text-white">
                <RotateCw className="w-3.5 h-3.5" /> Click to Flip Back
              </span>
            </div>

            <div className="text-center my-auto px-4 overflow-y-auto max-h-40">
              <p className="text-base sm:text-lg font-medium text-indigo-50 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="text-center text-xs text-indigo-200">
              Back side
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and Mastery Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-xs transition-colors"
          title="Previous Card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleMastered(currentIndex)}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs ${
            isCardMastered
              ? 'bg-emerald-600 text-white'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 hover:border-emerald-300'
          }`}
        >
          <Check className="w-4 h-4" />
          {isCardMastered ? 'Mastered ✓' : 'Mark as Mastered'}
        </button>

        <button
          onClick={handleNext}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-xs transition-colors"
          title="Next Card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

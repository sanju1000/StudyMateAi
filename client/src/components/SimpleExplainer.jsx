import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Lightbulb, Sparkles, Loader2, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function SimpleExplainer({ documentId }) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState('');

  const handleExplain = async (e) => {
    e?.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError('');
    setExplanation(null);

    try {
      const res = await api.post('/study/explain', {
        documentId,
        topic: topic.trim(),
        level
      });
      setExplanation(res.data.explanation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search / Prompt Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Simple Explanation Mode</h3>
            <p className="text-xs text-slate-500">
              Transform difficult or confusing concepts into crystal-clear analogies and step-by-step breakdowns.
            </p>
          </div>
        </div>

        <form onSubmit={handleExplain} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topic or Term to Explain
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Deadlock, B-Trees, Normalization, Virtual Memory..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Explanation Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'beginner', label: 'Beginner', desc: 'Real-world analogy' },
                { id: 'intermediate', label: 'Intermediate', desc: 'Conceptual + practical' },
                { id: 'advanced', label: 'Advanced', desc: 'Deep technical rigor' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className={`p-2.5 text-left rounded-xl border transition-all ${
                    level === lvl.id
                      ? 'border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <p className="text-xs font-bold">{lvl.label}</p>
                  <p className="text-[10px] text-slate-500">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Crafting intuitive explanation...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Explain Simply
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">
            {error}
          </p>
        )}
      </div>

      {/* Explanation Result */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Explanation for <span className="text-slate-800 font-bold">"{topic}"</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 uppercase">
              {level}
            </span>
          </div>

          <div className="prose prose-sm prose-slate max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

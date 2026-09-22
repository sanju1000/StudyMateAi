import React, { useState } from 'react';
import { Search, BookOpen, Loader2, Sparkles, FileText } from 'lucide-react';
import api from '../services/api';

export default function SemanticSearch({ documentId }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.get(`/documents/${documentId}/search?q=${encodeURIComponent(query.trim())}&limit=6`);
      setResults(res.data.results || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Semantic Document Search</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Search meaning and concepts across all chunks of your document, not just exact keywords.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. process synchronization conditions, normalization rules, deadlock recovery..."
              className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}
      </div>

      {/* Results List */}
      {searched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Search Results ({results.length} matched sections)</span>
            <span className="text-[11px] text-brand-600 font-medium">Ranked by Cosine Similarity</span>
          </div>

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No matching sections found for "{query}". Try rephrasing your search query.
            </div>
          ) : (
            results.map((res, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-brand-300 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Page / Section {res.page}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Match: {Math.round(res.score * 100)}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                  "{res.pageContent}"
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

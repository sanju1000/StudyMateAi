import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import MainLayout from '../layouts/MainLayout';
import FlashcardViewer from '../components/FlashcardViewer';
import QuizInterface from '../components/QuizInterface';
import SimpleExplainer from '../components/SimpleExplainer';
import SemanticSearch from '../components/SemanticSearch';
import {
  FileText,
  HelpCircle,
  Sparkles,
  Lightbulb,
  Search,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function StudyToolsPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Summary state
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // MCQs state
  const [mcqSet, setMcqSet] = useState(null);
  const [loadingMcq, setLoadingMcq] = useState(false);

  // Flashcards state
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const docRes = await api.get(`/documents/${documentId}`);
        setDocument(docRes.data.document);

        // Preload cached summary if exists
        if (docRes.data.document?.summary) {
          setSummary(docRes.data.document.summary);
        }

        // Preload past MCQs & flashcards if existing
        const [mcqRes, fcRes] = await Promise.all([
          api.get(`/study/mcq/${documentId}`).catch(() => ({ data: { mcqs: [] } })),
          api.get(`/study/flashcards/${documentId}`).catch(() => ({ data: { flashcards: [] } }))
        ]);

        if (mcqRes.data.mcqs?.length > 0) {
          setMcqSet(mcqRes.data.mcqs[0]);
        }
        if (fcRes.data.flashcards?.length > 0) {
          setFlashcardSet(fcRes.data.flashcards[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load study tools.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [documentId]);

  // Generate / Refresh Summary
  const handleGenerateSummary = async (forceRefresh = false) => {
    setLoadingSummary(true);
    try {
      const res = await api.post('/study/summary', {
        documentId,
        forceRefresh
      });
      setSummary(res.data.summary);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Copy summary to clipboard
  const handleCopySummary = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Generate MCQs
  const handleGenerateMCQ = async ({ count = 5, difficulty = 'medium' } = {}) => {
    setLoadingMcq(true);
    try {
      const res = await api.post('/study/mcq', {
        documentId,
        count,
        difficulty
      });
      setMcqSet(res.data.mcqs);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate MCQs.');
    } finally {
      setLoadingMcq(false);
    }
  };

  // Generate Flashcards
  const handleGenerateFlashcards = async () => {
    setLoadingFlashcards(true);
    try {
      const res = await api.post('/study/flashcards', {
        documentId,
        count: 8
      });
      setFlashcardSet(res.data.flashcards);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate flashcards.');
    } finally {
      setLoadingFlashcards(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading AI Study Toolkit...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !document) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">{error || 'Document not found.'}</p>
            <Link to="/dashboard" className="text-brand-600 underline mt-1 inline-block">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'summary', label: 'AI Summary', icon: FileText },
    { id: 'mcq', label: 'MCQ Quiz', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Sparkles },
    { id: 'explain', label: 'Explain Simply', icon: Lightbulb },
    { id: 'search', label: 'Semantic Search', icon: Search }
  ];

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header and Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link
              to="/dashboard"
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold truncate max-w-xs sm:max-w-md">
              {document.originalName}
            </span>
          </div>

          <Link
            to={`/chat/${document._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            Open Document Chat
          </Link>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pt-2">
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Comprehensive AI Summary</h3>
                    <p className="text-xs text-slate-500">
                      Structured high-yield overview synthesized from your document excerpts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {summary && (
                      <button
                        onClick={handleCopySummary}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSummary ? 'Copied!' : 'Copy Summary'}
                      </button>
                    )}

                    <button
                      onClick={() => handleGenerateSummary(true)}
                      disabled={loadingSummary}
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {loadingSummary ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCw className="w-3.5 h-3.5" />
                      )}
                      {summary ? 'Regenerate' : 'Generate Summary'}
                    </button>
                  </div>
                </div>

                {loadingSummary ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                    <p className="text-xs text-slate-500">Synthesizing comprehensive summary with Groq...</p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-10 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">
                      No summary generated yet. Click "Generate Summary" to produce a structured study guide.
                    </p>
                    <button
                      onClick={() => handleGenerateSummary(false)}
                      className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-xs"
                    >
                      Generate Summary Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MCQS */}
          {activeTab === 'mcq' && (
            <QuizInterface
              mcqSet={mcqSet}
              onGenerate={handleGenerateMCQ}
              loading={loadingMcq}
            />
          )}

          {/* TAB 3: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <FlashcardViewer
              flashcards={flashcardSet}
              onGenerate={handleGenerateFlashcards}
              loading={loadingFlashcards}
            />
          )}

          {/* TAB 4: SIMPLE EXPLAINER */}
          {activeTab === 'explain' && (
            <SimpleExplainer documentId={document._id} />
          )}

          {/* TAB 5: SEMANTIC SEARCH */}
          {activeTab === 'search' && (
            <SemanticSearch documentId={document._id} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

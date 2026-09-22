import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  Layers,
  Search,
  ArrowRight,
  CheckCircle2,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-brand-600" />
          Powered by LangChain + Groq RAG
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Upload Your Notes. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
            Ask Questions. Learn Faster.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          StudyMate AI turns your PDFs, DOCX, PPTX slides, and text notes into an interactive, 24/7 personal tutor.
          Retrieve exact answers, test yourself with auto-generated MCQs, and master complex ideas through simple analogies.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            Get Started for Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-200 shadow-xs transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Conversational Document RAG</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask any question about 100-page textbooks or lecture presentations. StudyMate AI semantically retrieves exact relevant chunks and cites page numbers.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Auto-Generated MCQs & Quizzes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Test your knowledge instantly before exams. Choose difficulty levels (Easy, Medium, Hard), get instant feedback, and see detailed explanations.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Flashcards & Simple Analogies</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Flip 3D flashcards for active recall revision, and switch to "Explain Simply" mode to understand tough topics using intuitive everyday analogies.
            </p>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col items-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Supports All Common Study Formats
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'PDF Documents', ext: '.pdf' },
              { label: 'Word Notes', ext: '.docx' },
              { label: 'PowerPoint Slides', ext: '.pptx' },
              { label: 'Text & Markdown', ext: '.txt' }
            ].map((f) => (
              <span
                key={f.ext}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs"
              >
                <span className="font-bold text-brand-600">{f.ext}</span> {f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500">
          StudyMate AI — Built with React, Node.js, MongoDB, LangChain & Groq RAG.
        </div>
      </footer>
    </div>
  );
}

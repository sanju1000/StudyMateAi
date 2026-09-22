import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ChatInterface from '../components/ChatInterface';
import {
  ArrowLeft,
  Wand2,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function DocumentChatPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await api.get(`/documents/${documentId}`);
        setDocument(res.data.document);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load document details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading document conversation workspace...</p>
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

  return (
    <MainLayout>
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex items-center justify-between">
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
            to={`/study/${document._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Switch to Study Tools
          </Link>
        </div>

        {/* Chat Interface */}
        <ChatInterface document={document} />
      </div>
    </MainLayout>
  );
}

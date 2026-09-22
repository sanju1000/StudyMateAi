import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import FileDropzone from '../components/FileDropzone';
import DocumentCard from '../components/DocumentCard';
import {
  BookOpen,
  FileCheck,
  Layers,
  Plus,
  Search,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Poll for document status updates if any document is processing
  useEffect(() => {
    const hasProcessing = documents.some(
      (d) => d.status === 'pending' || d.status === 'processing'
    );

    if (hasProcessing) {
      const timer = setInterval(() => {
        fetchDocuments();
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [documents]);

  const handleDeleteDocument = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All associated chats, MCQs, and flashcards will also be deleted.`)) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setShowUpload(false);
  };

  const filteredDocs = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const readyCount = documents.filter((d) => d.status === 'ready').length;
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 1), 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-brand-500/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome Back!
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-lg">
              Upload your lecture notes, slides, or books to chat with your materials and generate revision tools.
            </p>
          </div>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-brand-700 font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            {showUpload ? 'Close Upload' : 'Upload Material'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Materials</p>
              <p className="text-xl font-bold text-slate-800">{documents.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Ready for Study</p>
              <p className="text-xl font-bold text-slate-800">{readyCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Pages Indexed</p>
              <p className="text-xl font-bold text-slate-800">{totalPages}</p>
            </div>
          </div>
        </div>

        {/* Upload Drawer / Section */}
        {showUpload && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <FileDropzone onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Documents Collection Header & Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Study Materials</h2>
              <p className="text-xs text-slate-500">
                Select any document to start AI chat or generate quizzes and flashcards.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-xs font-medium text-slate-500">Loading your study documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Study Materials Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your first lecture notes (PDF, DOCX, PPTX, or TXT) to activate your personal AI study companion.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload Your First Document
              </button>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No documents matched "{searchTerm}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  doc={doc}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

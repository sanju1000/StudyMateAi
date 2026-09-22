import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Wand2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BookOpen
} from 'lucide-react';

export default function DocumentCard({ doc, onDelete }) {
  const getFormatBadgeColor = (type) => {
    switch (type) {
      case 'pdf': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'docx': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pptx': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'txt': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = () => {
    switch (doc.status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Ready ✓
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Type and Status */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFormatBadgeColor(doc.fileType)}`}>
            {doc.fileType}
          </span>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 title={doc.originalName}">
          {doc.originalName}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{doc.pageCount || 1} Pages</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{doc.conversationCount || 0} Chats</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            to={`/chat/${doc._id}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              doc.status === 'ready'
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 pointer-events-none'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </Link>
          <Link
            to={`/study/${doc._id}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              doc.status === 'ready'
                ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-slate-100 text-slate-400 pointer-events-none'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Study Tools
          </Link>
        </div>

        <button
          onClick={() => onDelete(doc._id, doc.originalName)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ documents = [], currentDocId }) {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Primary Navigation */}
      <div className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <hr className="border-slate-200 mx-4 my-2" />

      {/* Documents Quick Access */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          <span>My Documents</span>
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">
            {documents.length}
          </span>
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-1">
            {documents.map((doc) => {
              const isSelected = currentDocId === doc._id;
              return (
                <div key={doc._id} className="group">
                  <NavLink
                    to={`/chat/${doc._id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-brand-500 text-white font-medium shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate flex-1 text-xs" title={doc.originalName}>
                      {doc.originalName}
                    </span>
                    {doc.status === 'ready' && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                    )}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info card at bottom */}
      <div className="p-4 m-3 bg-gradient-to-br from-indigo-50 to-brand-50 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Study Pro-Tip
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Open any document to chat, generate instant MCQs, or flip flashcards for rapid exam revision.
        </p>
      </div>
    </aside>
  );
}

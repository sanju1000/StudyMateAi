import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

export default function MainLayout({ children }) {
  const [documents, setDocuments] = useState([]);
  const location = useLocation();

  // Extract current doc ID from URL if on chat or study page
  const match = location.pathname.match(/\/(chat|study)\/([a-zA-Z0-9_-]+)/);
  const currentDocId = match ? match[2] : null;

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.warn('Could not fetch sidebar documents:', err.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar documents={documents} currentDocId={currentDocId} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

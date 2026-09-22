import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Loader2,
  Bot,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';

export default function ChatInterface({ document }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load latest conversation if exists
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/chat/${document._id}`);
        if (res.data.conversations && res.data.conversations.length > 0) {
          const latestConv = res.data.conversations[0];
          setConversationId(latestConv._id);

          const msgRes = await api.get(`/chat/conversation/${latestConv._id}`);
          setMessages(msgRes.data.messages || []);
        } else {
          // Initialize friendly welcome message
          setMessages([
            {
              role: 'assistant',
              content: `Hello! I'm ready to answer any questions about **${document.originalName}**.\n\nTry asking:\n* "What is the main topic of this document?"\n* "Can you explain the key concepts?"\n* "What are the core definitions mentioned?"`,
              sources: []
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    if (document?._id) {
      fetchConversations();
    }
  }, [document?._id]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Append user message immediately
    const userMsgObj = {
      role: 'user',
      content: userText
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        documentId: document._id,
        conversationId: conversationId || undefined,
        message: userText
      });

      if (!conversationId && res.data.conversationId) {
        setConversationId(res.data.conversationId);
      }

      const aiMsgObj = {
        role: 'assistant',
        content: res.data.message.content,
        sources: res.data.message.sources || []
      };

      setMessages((prev) => [...prev, aiMsgObj]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to get answer from AI. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error:** ${errMsg}`,
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (idx) => {
    setExpandedSources((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePromptSuggestion = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Chatting with {document.originalName}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{document.pageCount || 1} Pages indexed</span>
              <span>•</span>
              <span className="text-emerald-600 font-medium">RAG Active</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setConversationId(null);
            setMessages([
              {
                role: 'assistant',
                content: `Started a fresh conversation for **${document.originalName}**. What would you like to explore?`,
                sources: []
              }
            ]);
          }}
          className="text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
        >
          New Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[82%] sm:max-w-[75%] space-y-2`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-sm'
                      : 'bg-brand-600 text-white rounded-tr-sm shadow-xs'
                  }`}
                >
                  {isAssistant ? (
                    <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Sources / Citations */}
                {isAssistant && msg.sources && msg.sources.length > 0 && (
                  <div className="text-xs bg-slate-100/70 border border-slate-200 rounded-xl p-2.5">
                    <button
                      onClick={() => toggleSource(index)}
                      className="flex items-center justify-between w-full font-medium text-slate-600 hover:text-slate-900"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                        Retrieved Sources ({msg.sources.length} chunks)
                      </span>
                      {expandedSources[index] ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {expandedSources[index] && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-2">
                        {msg.sources.map((src, sIdx) => (
                          <div key={sIdx} className="bg-white p-2 rounded-lg border border-slate-200/80">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                              <span>Page / Section {src.page}</span>
                              <span className="text-brand-600">Relevance: {Math.round((src.score || 0) * 100)}%</span>
                            </div>
                            <p className="text-[11px] text-slate-600 italic line-clamp-3">
                              "{src.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3.5 justify-start">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl rounded-tl-sm text-sm text-slate-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Retrieving document chunks and thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && !loading && (
        <div className="px-6 py-2 bg-slate-50/70 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Suggestions:
          </span>
          {[
            "Summarize the main points",
            "What are the key terms defined?",
            "Explain the most difficult concept",
            "Give me a study checklist"
          ].map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handlePromptSuggestion(prompt)}
              className="shrink-0 bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 text-slate-700 px-3 py-1 rounded-full transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything about your document..."
            disabled={loading}
            className="w-full pr-12 pl-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="absolute right-2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-brand-600 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

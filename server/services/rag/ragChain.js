import { vectorStore } from './vectorStore.js';
import { invokeGroq } from '../ai/groqService.js';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

/**
 * Runs the Conversational RAG pipeline for a question
 * @param {object} params
 * @param {string} params.documentId
 * @param {string} params.question
 * @param {Array<{ role: string, content: string }>} [params.chatHistory]
 * @returns {Promise<{ answer: string, sources: Array<{ page: number, snippet: string, score: number }> }>}
 */
export async function executeRagQuery({ documentId, question, chatHistory = [] }) {
  // 1. Retrieve top-4 relevant chunks
  const retrieved = await vectorStore.similaritySearch(documentId, question, 4);

  const contextText = retrieved.length > 0
    ? retrieved.map((item, idx) => `[Excerpt ${idx + 1} (Page/Section ${item.metadata?.page || 'N/A'})]:\n${item.pageContent}`).join('\n\n')
    : 'No relevant document excerpts found.';

  const systemPrompt = `You are StudyMate AI, an expert educational tutor helping a student study their uploaded notes and documents.

Guidelines:
1. Answer the student's question accurately and thoroughly based on the provided document excerpts below.
2. If the excerpts do not provide enough information to answer the question, clearly say: "I couldn't find enough information about this question in the uploaded document." Do NOT invent facts.
3. Format your response cleanly using Markdown: use headings, bold text, bullet points, and code blocks where helpful.
4. If appropriate, cite which page or section the answer came from.
5. Keep your tone encouraging, professional, and student-friendly.

DOCUMENT EXCERPTS:
${contextText}`;

  const messages = [
    new SystemMessage(systemPrompt)
  ];

  // Include recent chat history (last 6 messages for context)
  const recentHistory = chatHistory.slice(-6);
  for (const msg of recentHistory) {
    if (msg.role === 'user') {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === 'assistant') {
      messages.push(new AIMessage(msg.content));
    }
  }

  // Add current question
  messages.push(new HumanMessage(question));

  // 2. Invoke Groq
  const response = await invokeGroq(messages, {
    temperature: 0.2
  });

  const sources = retrieved.map(item => ({
    chunkId: item.id,
    page: item.metadata?.page || 1,
    snippet: item.pageContent.length > 200 ? item.pageContent.substring(0, 200) + '...' : item.pageContent,
    score: Math.round(item.score * 100) / 100
  }));

  return {
    answer: response.content,
    sources
  };
}

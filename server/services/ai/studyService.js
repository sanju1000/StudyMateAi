import { vectorStore } from '../rag/vectorStore.js';
import { invokeGroq } from './groqService.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import Document from '../../models/Document.js';
import MCQ from '../../models/MCQ.js';
import Flashcard from '../../models/Flashcard.js';

/**
 * Helper to get representative text from a document's vector store
 */
async function getRepresentativeContext(documentId, maxChunks = 8) {
  const vectors = await vectorStore.getDocumentVectors(documentId);
  if (!vectors || vectors.length === 0) {
    return '';
  }
  // Take evenly spaced chunks throughout the document to get broad coverage
  const step = Math.max(1, Math.floor(vectors.length / maxChunks));
  const sampled = [];
  for (let i = 0; i < vectors.length && sampled.length < maxChunks; i += step) {
    sampled.push(vectors[i].pageContent);
  }
  return sampled.join('\n\n---\n\n');
}

/**
 * Helper to parse JSON from AI response safely
 */
function extractJsonFromText(text) {
  try {
    // Look for markdown json codeblock
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Try finding raw array or object
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(text.substring(firstBracket, lastBracket + 1));
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse AI JSON:', e.message, 'Raw text was:', text);
    throw new Error('Unable to parse structured response from AI model. Please try again.');
  }
}

export const studyService = {
  /**
   * Generates a comprehensive structured summary
   */
  async generateSummary(documentId) {
    const context = await getRepresentativeContext(documentId, 10);
    if (!context) {
      throw new Error('No document content found to summarize.');
    }

    const systemPrompt = `You are an expert academic tutor. Summarize the provided document study material in clear, structured Markdown.
Follow this exact structure:
# Document Summary
## 1. Introduction
(Brief overview of what this material covers)
## 2. Core Concepts
(Main topics and themes discussed)
## 3. Key Definitions
(Important terms with concise, exact definitions)
## 4. Important Points & Formulae
(High-yield bullet points for revision)
## 5. Practical Examples
(Real-world applications or examples from the text)
## 6. Conclusion & Takeaways
(Summary takeaway for exam revision)`;

    const userPrompt = `Here is the study material:\n\n${context}\n\nPlease generate the comprehensive summary.`;

    const response = await invokeGroq([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ], { temperature: 0.3 });

    // Cache summary on document
    await Document.findByIdAndUpdate(documentId, { summary: response.content });

    return response.content;
  },

  /**
   * Generates Multiple Choice Questions (MCQs)
   */
  async generateMCQs(userId, documentId, { count = 5, difficulty = 'medium' }) {
    const context = await getRepresentativeContext(documentId, 10);
    if (!context) {
      throw new Error('No document content found to generate MCQs.');
    }

    const systemPrompt = `You are an exam creator. Generate ${count} high-quality Multiple Choice Questions (MCQs) based strictly on the provided study material.
Difficulty level: ${difficulty}.

You MUST return ONLY a valid JSON array of objects with the following schema, and NO other conversational text:
[
  {
    "question": "Question text here?",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correctAnswer": "A", // Or B, C, D
    "explanation": "Clear explanation of why this answer is correct based on the text."
  }
]`;

    const response = await invokeGroq([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Document Content:\n\n${context}`)
    ], { temperature: 0.4 });

    const questions = extractJsonFromText(response.content);

    // Save to database
    const savedMcq = await MCQ.create({
      userId,
      documentId,
      difficulty,
      questions
    });

    return savedMcq;
  },

  /**
   * Generates Flashcards for active recall revision
   */
  async generateFlashcards(userId, documentId, { count = 8 }) {
    const context = await getRepresentativeContext(documentId, 10);
    if (!context) {
      throw new Error('No document content found to generate flashcards.');
    }

    const systemPrompt = `You are a study flashcard creator. Generate ${count} concise, high-yield flashcards (Question on front, Answer on back) based on the provided material.
Focus on key definitions, core concepts, formulas, and fundamental mechanisms.

You MUST return ONLY a valid JSON array of objects with this format, and no extra text:
[
  {
    "question": "Clear concept or question",
    "answer": "Concise, precise explanation or definition"
  }
]`;

    const response = await invokeGroq([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Document Content:\n\n${context}`)
    ], { temperature: 0.4 });

    const cards = extractJsonFromText(response.content);

    const savedFlashcard = await Flashcard.create({
      userId,
      documentId,
      cards
    });

    return savedFlashcard;
  },

  /**
   * Generates an explanation at different simplicity levels (Beginner / Intermediate / Advanced)
   */
  async generateSimpleExplanation(documentId, { topic, level = 'beginner' }) {
    // Find relevant chunks for the topic
    const searchResults = await vectorStore.similaritySearch(documentId, topic, 4);
    const context = searchResults.map(r => r.pageContent).join('\n\n');

    let levelInstruction = '';
    if (level === 'beginner') {
      levelInstruction = 'Explain like I am 12 years old. Use an intuitive, everyday real-world analogy (e.g. food, library, traffic, sports). Avoid heavy technical jargon, make it friendly, memorable, and fun.';
    } else if (level === 'intermediate') {
      levelInstruction = 'Explain with conceptual clarity suitable for an undergraduate student. Provide balanced theory, clear bullet points, and a realistic technical example.';
    } else {
      levelInstruction = 'Provide an in-depth advanced technical breakdown covering underlying architecture, trade-offs, edge cases, and performance considerations.';
    }

    const systemPrompt = `You are StudyMate AI, specializing in pedagogical explanations.
The user wants an explanation of the topic: "${topic}".
Level requested: ${level.toUpperCase()}.
${levelInstruction}

Reference excerpts from their document:
${context || 'No specific excerpts found; rely on general principles while maintaining academic rigor.'}`;

    const response = await invokeGroq([
      new SystemMessage(systemPrompt),
      new HumanMessage(`Explain "${topic}" at the ${level} level.`)
    ], { temperature: 0.5 });

    return {
      topic,
      level,
      explanation: response.content
    };
  }
};

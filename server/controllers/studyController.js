import Document from '../models/Document.js';
import MCQ from '../models/MCQ.js';
import Flashcard from '../models/Flashcard.js';
import { studyService } from '../services/ai/studyService.js';

export const getSummary = async (req, res, next) => {
  try {
    const { documentId, forceRefresh } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, message: 'documentId is required.' });
    }

    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Return cached summary if available and not forcing refresh
    if (doc.summary && !forceRefresh) {
      return res.status(200).json({
        success: true,
        summary: doc.summary,
        cached: true
      });
    }

    const summary = await studyService.generateSummary(documentId);

    res.status(200).json({
      success: true,
      summary,
      cached: false
    });
  } catch (err) {
    next(err);
  }
};

export const generateMCQs = async (req, res, next) => {
  try {
    const { documentId, count = 5, difficulty = 'medium' } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, message: 'documentId is required.' });
    }

    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const mcqSet = await studyService.generateMCQs(req.user._id, documentId, {
      count: Math.min(15, Math.max(1, parseInt(count, 10))),
      difficulty
    });

    res.status(201).json({
      success: true,
      mcqs: mcqSet
    });
  } catch (err) {
    next(err);
  }
};

export const getSavedMCQs = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const mcqs = await MCQ.find({ documentId, userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      mcqs
    });
  } catch (err) {
    next(err);
  }
};

export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 8 } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, message: 'documentId is required.' });
    }

    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const flashcardSet = await studyService.generateFlashcards(req.user._id, documentId, {
      count: Math.min(20, Math.max(1, parseInt(count, 10)))
    });

    res.status(201).json({
      success: true,
      flashcards: flashcardSet
    });
  } catch (err) {
    next(err);
  }
};

export const getSavedFlashcards = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const flashcards = await Flashcard.find({ documentId, userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      flashcards
    });
  } catch (err) {
    next(err);
  }
};

export const explainTopic = async (req, res, next) => {
  try {
    const { documentId, topic, level = 'beginner' } = req.body;

    if (!documentId || !topic) {
      return res.status(400).json({
        success: false,
        message: 'documentId and topic are required.'
      });
    }

    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const result = await studyService.generateSimpleExplanation(documentId, {
      topic,
      level
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

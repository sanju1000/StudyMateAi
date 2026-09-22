import Document from '../models/Document.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import MCQ from '../models/MCQ.js';
import Flashcard from '../models/Flashcard.js';
import { processDocumentAsync } from '../services/documents/documentService.js';
import { vectorStore } from '../services/rag/vectorStore.js';
import fs from 'fs';
import path from 'path';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please choose a PDF, DOCX, PPTX, or TXT file.'
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const document = await Document.create({
      userId: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: ext,
      fileSize: req.file.size,
      filePath: req.file.path,
      status: 'pending'
    });

    // Start background processing without blocking response
    processDocumentAsync(document._id);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Processing started.',
      document
    });
  } catch (err) {
    next(err);
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    // Also include conversation counts for each document
    const documentsWithStats = await Promise.all(
      documents.map(async (doc) => {
        const conversationCount = await Conversation.countDocuments({ documentId: doc._id });
        return {
          ...doc.toObject(),
          conversationCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: documentsWithStats.length,
      documents: documentsWithStats
    });
  } catch (err) {
    next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      document
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.'
      });
    }

    // Remove physical file
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (e) {
        console.warn('Failed to delete file on disk:', e.message);
      }
    }

    // Remove vector embeddings
    await vectorStore.deleteDocumentVectors(document._id.toString());

    // Cascade delete conversations and messages
    const conversations = await Conversation.find({ documentId: document._id });
    const convIds = conversations.map(c => c._id);
    await Message.deleteMany({ conversationId: { $in: convIds } });
    await Conversation.deleteMany({ documentId: document._id });

    // Cascade delete MCQs & Flashcards
    await MCQ.deleteMany({ documentId: document._id });
    await Flashcard.deleteMany({ documentId: document._id });

    // Delete Document
    await Document.findByIdAndDelete(document._id);

    res.status(200).json({
      success: true,
      message: 'Document and all associated study materials deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const searchDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required.'
      });
    }

    const document = await Document.findOne({ _id: id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.'
      });
    }

    const results = await vectorStore.similaritySearch(id, q, parseInt(limit, 10));

    res.status(200).json({
      success: true,
      query: q,
      document: {
        id: document._id,
        fileName: document.originalName
      },
      results: results.map(r => ({
        id: r.id,
        pageContent: r.pageContent,
        page: r.metadata?.page || 1,
        score: Math.round(r.score * 100) / 100
      }))
    });
  } catch (err) {
    next(err);
  }
};

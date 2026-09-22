import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Document from '../models/Document.js';
import { executeRagQuery } from '../services/rag/ragChain.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { documentId, conversationId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({
        success: false,
        message: 'documentId and message are required.'
      });
    }

    const doc = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.'
      });
    }

    if (doc.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: `Document is currently in '${doc.status}' status. Please wait until processing is ready.`
      });
    }

    // Find or create conversation
    let conv;
    if (conversationId) {
      conv = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
    }

    if (!conv) {
      // Derive a short title from the first question
      const shortTitle = message.length > 40 ? message.substring(0, 40) + '...' : message;
      conv = await Conversation.create({
        userId: req.user._id,
        documentId: doc._id,
        title: shortTitle
      });
    }

    // Fetch prior messages in this conversation for context
    const previousMessages = await Message.find({ conversationId: conv._id })
      .sort({ createdAt: 1 })
      .limit(10);

    const chatHistory = previousMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Save user message to database
    await Message.create({
      conversationId: conv._id,
      role: 'user',
      content: message
    });

    // Execute RAG query
    const { answer, sources } = await executeRagQuery({
      documentId: doc._id.toString(),
      question: message,
      chatHistory
    });

    // Save assistant response
    const assistantMessage = await Message.create({
      conversationId: conv._id,
      role: 'assistant',
      content: answer,
      sources
    });

    res.status(200).json({
      success: true,
      conversationId: conv._id,
      conversationTitle: conv.title,
      message: {
        id: assistantMessage._id,
        role: 'assistant',
        content: answer,
        sources,
        createdAt: assistantMessage.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const conversations = await Conversation.find({
      documentId,
      userId: req.user._id
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (err) {
    next(err);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      conversation,
      messages
    });
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    await Message.deleteMany({ conversationId });

    res.status(200).json({
      success: true,
      message: 'Conversation deleted.'
    });
  } catch (err) {
    next(err);
  }
};

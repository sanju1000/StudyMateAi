import mongoose from 'mongoose';
import { createSmartModel } from './dbAdapter.js';

const mcqSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

const MongooseMCQ = mongoose.models.MCQ || mongoose.model('MCQ', mcqSchema);
const MCQ = createSmartModel('mcqs', MongooseMCQ);

export default MCQ;

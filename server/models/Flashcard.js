import mongoose from 'mongoose';
import { createSmartModel } from './dbAdapter.js';

const flashcardSchema = new mongoose.Schema({
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
  cards: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }]
}, {
  timestamps: true
});

const MongooseFC = mongoose.models.Flashcard || mongoose.model('Flashcard', flashcardSchema);
const Flashcard = createSmartModel('flashcards', MongooseFC);

export default Flashcard;

import mongoose from 'mongoose';
import { createSmartModel } from './dbAdapter.js';

const conversationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    default: 'New Conversation'
  }
}, {
  timestamps: true
});

const MongooseConv = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
const Conversation = createSmartModel('conversations', MongooseConv);

export default Conversation;

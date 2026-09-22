import mongoose from 'mongoose';
import { createSmartModel } from './dbAdapter.js';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sources: [{
    chunkId: String,
    page: Number,
    snippet: String,
    score: Number
  }]
}, {
  timestamps: true
});

const MongooseMsg = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Message = createSmartModel('messages', MongooseMsg);

export default Message;

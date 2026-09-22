import mongoose from 'mongoose';
import { createSmartModel } from './dbAdapter.js';

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'pptx', 'txt']
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'error'],
    default: 'pending',
    index: true
  },
  pageCount: {
    type: Number,
    default: 1
  },
  chunkCount: {
    type: Number,
    default: 0
  },
  summary: {
    type: String,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const MongooseDoc = mongoose.models.Document || mongoose.model('Document', documentSchema);
const Document = createSmartModel('documents', MongooseDoc);

export default Document;

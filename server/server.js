import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import studyRoutes from './routes/studyRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    groqConfigured: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key')
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/study', studyRoutes);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Database Connection with seamless fallback
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri !== 'your_mongodb_connection_string') {
    try {
      console.log('Connecting to configured MongoDB...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to configured MONGO_URI:', err.message);
    }
  }

  // Attempt local MongoDB on standard port
  try {
    console.log('Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/studymate)...');
    await mongoose.connect('mongodb://127.0.0.1:27017/studymate', {
      serverSelectionTimeoutMS: 1500
    });
    console.log('✅ Connected to local MongoDB instance.');
    return;
  } catch (err) {
    console.warn('⚠️ Local MongoDB not detected.');
  }

  console.log('📁 Running in Zero-Config Mode with built-in persistent local document database (server/data/studymate_db.json).');
  console.log('💡 Note: You can connect your persistent MongoDB Atlas cluster anytime by adding MONGO_URI to server/.env');
}

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 StudyMate AI Server listening on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});

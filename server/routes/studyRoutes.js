import express from 'express';
import {
  getSummary,
  generateMCQs,
  getSavedMCQs,
  generateFlashcards,
  getSavedFlashcards,
  explainTopic
} from '../controllers/studyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/summary', getSummary);
router.post('/mcq', generateMCQs);
router.get('/mcq/:documentId', getSavedMCQs);
router.post('/flashcards', generateFlashcards);
router.get('/flashcards/:documentId', getSavedFlashcards);
router.post('/explain', explainTopic);

export default router;

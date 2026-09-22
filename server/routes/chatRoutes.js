import express from 'express';
import {
  sendMessage,
  getConversations,
  getConversationMessages,
  deleteConversation
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:documentId', getConversations);
router.get('/conversation/:conversationId', getConversationMessages);
router.delete('/conversation/:conversationId', deleteConversation);

export default router;

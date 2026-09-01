import express from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  handleSupportChat
} from '../controllers/supportController.js';

const router = express.Router();

router.post('/support/tickets', createSupportTicket);
router.get('/support/tickets', getSupportTickets);
router.post('/support/chat', handleSupportChat);

export default router;

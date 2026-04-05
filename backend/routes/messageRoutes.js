import express from 'express';
import { verifyToken, checkAdminRole, checkCustomerRole } from '../middleware/auth.js';
import {
  sendMessage,
  getOrderMessages,
  getOrderConversation,
} from '../controllers/messageController.js';

const router = express.Router();

// Send message (both admin and customer can send)
router.post('/', verifyToken, sendMessage);

// Get messages for an order
router.get('/:orderId', verifyToken, getOrderMessages);

// Get full order conversation (messages + order details)
router.get('/conversation/:orderId', verifyToken, getOrderConversation);

export default router;

import express from 'express';
import { verifyToken, checkAdminRole } from '../middleware/auth.js';
import { 
  getOrderStats, 
  getAllOrders, 
  updateOrderStatus,
  uploadQRCode,
  uploadPaymentReceipt,
  approvePayment,
  rejectPayment
} from '../controllers/orderController.js';

const router = express.Router();

// Admin dashboard stats
router.get('/stats', verifyToken, checkAdminRole, getOrderStats);

// All orders for admin
router.get('/orders', verifyToken, checkAdminRole, getAllOrders);

// Update order status
router.put('/orders/:id', verifyToken, checkAdminRole, updateOrderStatus);

// Payment management routes
router.put('/orders/:id/upload-qr', verifyToken, checkAdminRole, uploadQRCode);
router.put('/orders/:id/approve-payment', verifyToken, checkAdminRole, approvePayment);
router.put('/orders/:id/reject-payment', verifyToken, checkAdminRole, rejectPayment);

export default router;

import express from 'express';
import { verifyToken, checkAdminRole, checkCustomerRole } from '../middleware/auth.js';
import {
  createOrder,
  getUserOrders,
  uploadPaymentReceipt,
} from '../controllers/orderController.js';

const router = express.Router();

// Customer routes
router.post('/', verifyToken, checkCustomerRole, createOrder);
router.get('/my-orders', verifyToken, checkCustomerRole, getUserOrders);

// Payment receipt upload by customer
router.put('/:id/payment-receipt', verifyToken, checkCustomerRole, uploadPaymentReceipt);

export default router;

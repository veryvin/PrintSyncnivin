import express from 'express';
import { verifyToken, checkAdminRole } from '../middleware/auth.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', verifyToken, checkAdminRole, createProduct);
router.put('/:id', verifyToken, checkAdminRole, updateProduct);
router.delete('/:id', verifyToken, checkAdminRole, deleteProduct);

export default router;

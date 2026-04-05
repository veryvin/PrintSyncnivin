import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  registerUser,
  getUserProfile,
  updateUserProfile,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);

export default router;

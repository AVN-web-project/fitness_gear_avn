import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile
} from '../controllers/userController.js';

const router = express.Router();

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/user/profile', getUserProfile);

export default router;

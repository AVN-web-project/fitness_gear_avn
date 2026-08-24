import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  validateCart
} from '../controllers/cartController.js';

const router = express.Router();

router.get('/cart', getCart);
router.post('/cart', addToCart);
router.patch('/cart/:itemId', updateCartItem);
router.delete('/cart/:itemId', removeCartItem);
router.post('/cart/validate', validateCart);

export default router;

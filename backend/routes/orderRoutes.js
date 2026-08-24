import express from 'express';
import { createOrder, createCheckoutOrder, getOrderById } from '../controllers/orderController.js';

const router = express.Router();

router.post('/orders', createOrder);
router.post('/checkout/create-order', createCheckoutOrder);
router.get('/orders/:id', getOrderById);

export default router;

import express from 'express';
import { createOrder, createCheckoutOrder, getOrdersByUserEmail, getOrderById, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/orders', getOrdersByUserEmail);
router.post('/orders', createOrder);
router.post('/checkout/create-order', createCheckoutOrder);
router.get('/orders/:id', getOrderById);

export default router;
router.put('/orders/:id/status', updateOrderStatus);

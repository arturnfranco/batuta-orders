import { Router } from 'express';
import {
  createOrder,
  getOrders,
  updateOrderStatus
} from '../controllers/order.controller';


const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

export default router;

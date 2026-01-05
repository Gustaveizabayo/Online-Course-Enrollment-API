import { Router } from 'express';
import { PaymentController } from './payment.controller';  // Fixed import

const router = Router();
const paymentController = new PaymentController();

router.post('/create', paymentController.createPayment);
router.get('/success', paymentController.paymentSuccess);

export default router;
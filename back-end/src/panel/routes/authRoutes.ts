import { Router } from 'express';
import { getCurrentAdmin, loginAdmin, registerAdmin } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', authMiddleware, getCurrentAdmin);

export default router;

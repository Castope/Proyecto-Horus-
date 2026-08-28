import express from 'express';
import { getCurrentAdmin, loginAdmin, registerAdmin } from '../controllers/adminAuthController';
import { authMiddleware } from '../middleware/authMiddleware';
import { createAdminItem, deleteAdminItem, getAdminItems, updateAdminItem } from '../controllers/adminItemController';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', authMiddleware, getCurrentAdmin);

router.get('/items', authMiddleware, getAdminItems);
router.post('/items', authMiddleware, createAdminItem);
router.put('/items/:id', authMiddleware, updateAdminItem);
router.delete('/items/:id', authMiddleware, deleteAdminItem);

export default router;

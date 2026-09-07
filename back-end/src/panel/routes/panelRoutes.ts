import { Router } from 'express';
import { getCurrentAdmin, loginAdmin, registerAdmin } from '../controllers/authController';
import { createAdminItem, deleteAdminItem, getAdminItem, getAdminItems, updateAdminItem } from '../controllers/itemController';
import { createMessage, deleteMessage, getMessage, getMessages, updateMessage } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', authMiddleware, getCurrentAdmin);

router.get('/items', authMiddleware, getAdminItems);
router.post('/items', authMiddleware, createAdminItem);
router.get('/items/:id', authMiddleware, getAdminItem);
router.put('/items/:id', authMiddleware, updateAdminItem);
router.delete('/items/:id', authMiddleware, deleteAdminItem);

router.get('/messages', authMiddleware, getMessages);
router.post('/messages', authMiddleware, createMessage);
router.get('/messages/:id', authMiddleware, getMessage);
router.put('/messages/:id', authMiddleware, updateMessage);
router.delete('/messages/:id', authMiddleware, deleteMessage);

export default router;

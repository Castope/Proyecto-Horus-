import { Router } from 'express';
import {
  createMessage,
  deleteMessage,
  getMessage,
  getMessages,
  updateMessage,
} from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getMessages);
router.post('/', createMessage);
router.get('/:id', getMessage);
router.put('/:id', updateMessage);
router.delete('/:id', deleteMessage);

export default router;

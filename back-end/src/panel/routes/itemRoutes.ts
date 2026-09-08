import { Router } from 'express';
import {
  createAdminItem,
  deleteAdminItem,
  getAdminItem,
  getAdminItems,
  updateAdminItem,
} from '../controllers/itemController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAdminItems);
router.post('/', createAdminItem);
router.get('/:id', getAdminItem);
router.put('/:id', updateAdminItem);
router.delete('/:id', deleteAdminItem);

export default router;

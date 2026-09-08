import { Router } from 'express';
import authRoutes from './authRoutes';
import itemRoutes from './itemRoutes';
import messageRoutes from './messageRoutes';

const router = Router();

router.use('/', authRoutes);
router.use('/items', itemRoutes);
router.use('/messages', messageRoutes);

export default router;
export { authRoutes, itemRoutes, messageRoutes };

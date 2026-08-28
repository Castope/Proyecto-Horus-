import express from 'express';
import { registrarReclamo } from '../controllers/reclamacionController';

const router = express.Router();

router.post('/', registrarReclamo);

export default router;

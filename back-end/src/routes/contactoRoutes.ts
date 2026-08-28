import express from 'express';
import { enviarContacto } from '../controllers/contactoController';

const router = express.Router();

router.post('/', enviarContacto);

export default router;

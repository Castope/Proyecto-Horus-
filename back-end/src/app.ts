import cors from 'cors';
import express, { type Application } from 'express';
import contactoRoutes from './routes/contactoRoutes';
import reclamacionRoutes from './routes/reclamacionRoutes';

const app: Application = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
  }),
);

app.use(express.json());
app.use('/api/contacto', contactoRoutes);
app.use('/api/reclamaciones', reclamacionRoutes);

export default app;

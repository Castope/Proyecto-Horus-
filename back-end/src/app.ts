import cors from 'cors';
import express, { type Application } from 'express';
import contactoRoutes from './routes/contactoRoutes';
import reclamacionRoutes from './routes/reclamacionRoutes';
import adminRoutes from './routes/adminRoutes';

const app: Application = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use('/api/contacto', contactoRoutes);
app.use('/api/reclamaciones', reclamacionRoutes);
app.use('/api/admin', adminRoutes);

export default app;

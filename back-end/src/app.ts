import cors from 'cors';
import express, { type Application } from 'express';
import contactoRoutes from './routes/contactoRoutes';
import reclamacionRoutes from './routes/reclamacionRoutes';
import panelRoutes from './panel/routes/panelRoutes';

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
// El panel conserva este prefijo para que el frontend no necesite cambios.
app.use('/api/admin', panelRoutes);

export default app;

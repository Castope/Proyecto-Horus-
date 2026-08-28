import 'dotenv/config';
import app from './src/app';
import sequelize from './src/config/database';

import './src/models/Contacto';
import './src/models/Reclamacion';
import './src/models/AdminUser';
import './src/models/AdminItem';

const PORT = Number(process.env.PORT) || 3000;

async function iniciar(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error al iniciar el servidor:', message);
    process.exit(1);
  }
}

iniciar();

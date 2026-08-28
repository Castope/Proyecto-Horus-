"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./src/app"));
const database_1 = __importDefault(require("./src/config/database"));
require("./src/models/Contacto");
require("./src/models/Reclamacion");
const PORT = Number(process.env.PORT) || 3000;
async function iniciar() {
    try {
        await database_1.default.authenticate();
        console.log('✅ Conectado a MySQL');
        await database_1.default.sync({ alter: true });
        console.log('✅ Tablas sincronizadas');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error al iniciar el servidor:', message);
        process.exit(1);
    }
}
iniciar();

const { DataTypes: D } = require('sequelize');
module.exports.up = async function (qi) {
  const fields = {
    id: { type: D.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    numero: { type: D.STRING(60), unique: true, allowNull: false },
    cliente: { type: D.STRING(160), allowNull: false },
    email: { type: D.STRING(254), allowNull: false },
    telefono: { type: D.STRING(30), allowNull: false },
    documento: { type: D.STRING(30), allowNull: false },
    direccion: { type: D.STRING(300), allowNull: false },
    emisor: { type: D.STRING(160), allowNull: false },
    datos_emisor: { type: D.STRING(500), allowNull: false },
    moneda: { type: D.STRING(3), allowNull: false },
    validez: { type: D.DATEONLY, allowNull: false },
    condiciones: { type: D.TEXT, allowNull: false },
    conceptos: { type: D.JSON, allowNull: false },
    estado: { type: D.STRING(20), allowNull: false, defaultValue: 'borrador' },
    contacto_id: { type: D.INTEGER, allowNull: true },
    revision: { type: D.INTEGER, allowNull: false, defaultValue: 1 },
    historial: { type: D.JSON, allowNull: false },
    createdAt: { type: D.DATE, allowNull: false }, updatedAt: { type: D.DATE, allowNull: false },
    tasa: { type: D.DECIMAL(5,2), allowNull: false },
  };
  for (const key of ['subtotal', 'descuento', 'impuesto', 'total']) fields[key] = { type: D.DECIMAL(14,2), allowNull: false };
  await qi.createTable('cotizaciones', fields);
};

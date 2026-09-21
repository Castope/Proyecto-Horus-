const { DataTypes } = require('sequelize');
// Immutable schema for this migration. No sample content is inserted.
module.exports.up = async function (queryInterface) {
  await queryInterface.createTable('cursos', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    titulo: { type: DataTypes.STRING(160), allowNull: false, },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true, },
    descripcion: { type: DataTypes.TEXT, allowNull: false, },
    tipo: { type: DataTypes.ENUM('curso', 'capacitacion'), allowNull: false, },
    modalidad: { type: DataTypes.ENUM('presencial', 'virtual', 'hibrida'), allowNull: false, },
    duracion: { type: DataTypes.STRING(120), allowNull: false, },
    temario: { type: DataTypes.TEXT, allowNull: true, },
    imagen_url: { type: DataTypes.STRING(2048), allowNull: true, },
    fecha_inicio: { type: DataTypes.DATE, allowNull: true, },
    estado: { type: DataTypes.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador', },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  });
  await queryInterface.createTable('servicios', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    titulo: { type: DataTypes.STRING(160), allowNull: false, },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true, },
    descripcion: { type: DataTypes.TEXT, allowNull: false, },
    categoria: { type: DataTypes.ENUM('cableado', 'camaras', 'soporte', 'asesoramiento', 'otros'), allowNull: false, },
    alcance: { type: DataTypes.TEXT, allowNull: true, },
    imagen_url: { type: DataTypes.STRING(2048), allowNull: true, },
    estado: { type: DataTypes.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador', },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  });
  await queryInterface.createTable('preguntas_frecuentes', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    pregunta: { type: DataTypes.STRING(300), allowNull: false, },
    respuesta: { type: DataTypes.TEXT, allowNull: false, },
    categoria: { type: DataTypes.STRING(100), allowNull: false, },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, },
    estado: { type: DataTypes.ENUM('borrador', 'publicado', 'archivado'), allowNull: false, defaultValue: 'borrador', },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  });
};

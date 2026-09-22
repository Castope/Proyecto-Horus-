CREATE TABLE IF NOT EXISTS `cursos` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(160) NOT NULL,
  `slug` VARCHAR(180) NOT NULL UNIQUE,
  `descripcion` TEXT NOT NULL,
  `tipo` ENUM('curso', 'capacitacion') NOT NULL,
  `modalidad` ENUM('presencial', 'virtual', 'hibrida') NOT NULL,
  `duracion` VARCHAR(120) NOT NULL,
  `temario` TEXT NULL,
  `imagen_url` VARCHAR(2048) NULL,
  `fecha_inicio` DATETIME NULL,
  `estado` ENUM('borrador', 'publicado', 'archivado') NOT NULL DEFAULT 'borrador',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `servicios` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(160) NOT NULL,
  `slug` VARCHAR(180) NOT NULL UNIQUE,
  `descripcion` TEXT NOT NULL,
  `categoria` ENUM('cableado', 'camaras', 'soporte', 'asesoramiento', 'otros') NOT NULL,
  `alcance` TEXT NULL,
  `imagen_url` VARCHAR(2048) NULL,
  `estado` ENUM('borrador', 'publicado', 'archivado') NOT NULL DEFAULT 'borrador',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `preguntas_frecuentes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `pregunta` VARCHAR(300) NOT NULL,
  `respuesta` TEXT NOT NULL,
  `categoria` VARCHAR(100) NOT NULL,
  `orden` INTEGER NOT NULL DEFAULT 0,
  `estado` ENUM('borrador', 'publicado', 'archivado') NOT NULL DEFAULT 'borrador',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

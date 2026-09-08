import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo global /api para mantener compatibilidad total con el frontend
  app.setGlobalPrefix('api');

  // Configuración de CORS para desarrollo y producción local
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validación y transformación automática de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Documentación OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Horus Group API')
    .setDescription('API REST oficial para Horus Group SRL (Web Pública y Panel Administrativo)')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingrese su token JWT (sin el prefijo Bearer)',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(`🚀 Servidor NestJS corriendo en: http://localhost:${port}/api`);
  logger.log(`📚 Documentación Swagger interactiva en: http://localhost:${port}/api/docs`);
}

bootstrap();

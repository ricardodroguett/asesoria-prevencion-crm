import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://asesoriaprevencion.cl',
      'https://app.asesoriaprevencion.cl',
      'https://portal.asesoriaprevencion.cl',
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Asesoría Prevención CRM API')
    .setDescription(
      'API REST para el sistema CRM de Asesoría Prevención SpA - Consultoría en Seguridad y Salud Ocupacional',
    )
    .setVersion('1.0.0')
    .setContact(
      'Soporte Técnico',
      'https://asesoriaprevencion.cl',
      'soporte@asesoriaprevencion.cl',
    )
    .addTag('health', 'Health checks y estado del sistema')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('companies', 'Gestión de empresas/clientes')
    .addTag('opportunities', 'Gestión de oportunidades comerciales')
    .addTag('proposals', 'Propuestas y cotizaciones')
    .addTag('activities', 'Actividades comerciales')
    .addTag('tasks', 'Tareas y checklists')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Asesoría Prevención - API Docs',
    customfavIcon: 'https://asesoriaprevencion.cl/favicon.ico',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 Asesoría Prevención CRM - API Backend');
  console.log('🚀 ========================================');
  console.log(`🌐 Application: http://localhost:${port}/api`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${port}/api/health`);
  console.log('🚀 ========================================');
  console.log('');
}

bootstrap();

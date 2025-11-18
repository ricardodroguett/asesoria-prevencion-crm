import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    // Validar variables de entorno críticas
    const requiredEnvVars = ['DATABASE_URL'];
    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingEnvVars.length > 0) {
      console.error('❌ ERROR: Faltan variables de entorno críticas:');
      missingEnvVars.forEach((varName) => {
        console.error(`   - ${varName}`);
      });
      console.error(
        '\n💡 Configura estas variables en Render Dashboard > Environment',
      );
      process.exit(1);
    }

    console.log('✅ Variables de entorno validadas');
    console.log('🔄 Iniciando aplicación NestJS...');

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

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

    console.log('✅ CORS configurado');

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

    console.log('✅ Pipes de validación configurados');

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

    console.log('✅ Swagger documentación configurada');

    // Puerto con fallback robusto
    const port = process.env.PORT || 3000;

    // Escuchar en todas las interfaces (0.0.0.0) necesario para Render
    await app.listen(port, '0.0.0.0');

    console.log('');
    console.log('🚀 ========================================');
    console.log('🚀 Asesoría Prevención CRM - API Backend');
    console.log('🚀 ========================================');
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Application: http://0.0.0.0:${port}/api`);
    console.log(`📚 Swagger Docs: http://0.0.0.0:${port}/api/docs`);
    console.log(`💚 Health Check: http://0.0.0.0:${port}/api/health`);
    console.log('🚀 ========================================');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ ========================================');
    console.error('❌ ERROR FATAL AL INICIAR LA APLICACIÓN');
    console.error('❌ ========================================');
    console.error('');
    console.error('Detalles del error:');
    console.error(error);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    console.error('');
    console.error('Variables de entorno disponibles:');
    console.error('  NODE_ENV:', process.env.NODE_ENV);
    console.error('  PORT:', process.env.PORT);
    console.error(
      '  DATABASE_URL:',
      process.env.DATABASE_URL ? '✓ configurada' : '✗ NO configurada',
    );
    console.error('');
    console.error('❌ ========================================');
    console.error('');
    process.exit(1);
  }
}

bootstrap();

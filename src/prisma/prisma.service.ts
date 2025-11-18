import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      console.log('🔄 Conectando a base de datos...');
      console.log(
        '   DATABASE_URL:',
        process.env.DATABASE_URL ? '✓ configurada' : '✗ NO configurada',
      );

      await this.$connect();
      console.log('✅ Conexión a base de datos establecida exitosamente');

      // Test query para validar conexión
      await this.$queryRaw`SELECT 1`;
      console.log('✅ Base de datos responde correctamente');
    } catch (error) {
      console.error('');
      console.error('❌ ========================================');
      console.error('❌ ERROR AL CONECTAR A LA BASE DE DATOS');
      console.error('❌ ========================================');
      console.error('');
      console.error('Detalles del error:');
      console.error(error.message);
      console.error('');
      console.error('Posibles causas:');
      console.error(
        '  1. DATABASE_URL no está configurada o es incorrecta',
      );
      console.error(
        '  2. El servidor de base de datos no está accesible',
      );
      console.error(
        '  3. Credenciales de base de datos incorrectas',
      );
      console.error(
        '  4. El host de base de datos requiere whitelist de IPs',
      );
      console.error('');
      console.error('Verifica en Render Dashboard > Environment:');
      console.error(
        '  DATABASE_URL=postgresql://user:password@host:5432/dbname',
      );
      console.error('');
      console.error('❌ ========================================');
      console.error('');
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('✅ Conexión a base de datos cerrada correctamente');
    } catch (error) {
      console.error('⚠️  Error al cerrar conexión a base de datos:', error.message);
    }
  }
}

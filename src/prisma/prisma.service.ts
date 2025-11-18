import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Conexión a base de datos establecida');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Conexión a base de datos cerrada');
  }
}



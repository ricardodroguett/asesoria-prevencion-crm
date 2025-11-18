import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint - Información básica del API' })
  @ApiResponse({ status: 200, description: 'Información del sistema' })
  getRoot(): object {
    return {
      name: 'Asesoría Prevención CRM API',
      version: '1.0.0',
      company: 'Asesoría Prevención SpA',
      description:
        'Sistema de gestión comercial y técnica para consultoría en Seguridad y Salud Ocupacional',
      docs: '/api/docs',
      health: '/api/health',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check - Validar estado del sistema' })
  @ApiResponse({ status: 200, description: 'Sistema operativo' })
  healthCheck(): object {
    return {
      status: 'healthy',
      service: 'Asesoría Prevención CRM',
      database: 'connected',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
import { CompanyEntity } from './entities/company.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CEO, UserRole.DIR_COMERCIAL, UserRole.COMERCIAL)
  @ApiOperation({ summary: 'Crear nueva empresa/cliente' })
  @ApiResponse({
    status: 201,
    description: 'Empresa creada exitosamente',
    type: CompanyEntity,
  })
  @ApiResponse({ status: 409, description: 'RUT duplicado' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas',
  })
  findAll(@Query() query: QueryCompanyDto) {
    return this.companiesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.CEO, UserRole.DIR_COMERCIAL)
  @ApiOperation({ summary: 'Obtener estadísticas de empresas' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generales',
  })
  getStats() {
    return this.companiesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
    type: CompanyEntity,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CEO, UserRole.DIR_COMERCIAL, UserRole.COMERCIAL)
  @ApiOperation({ summary: 'Actualizar empresa' })
  @ApiResponse({
    status: 200,
    description: 'Empresa actualizada',
    type: CompanyEntity,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CEO)
  @ApiOperation({ summary: 'Eliminar empresa (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Empresa marcada como cerrada',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.remove(id);
  }
}



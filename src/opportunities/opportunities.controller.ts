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
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { OpportunityEntity } from './entities/opportunity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('opportunities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @Roles(
    UserRole.ADMIN,
    UserRole.CEO,
    UserRole.DIR_COMERCIAL,
    UserRole.COMERCIAL,
  )
  @ApiOperation({ summary: 'Crear nueva oportunidad comercial' })
  @ApiResponse({
    status: 201,
    description: 'Oportunidad creada exitosamente',
    type: OpportunityEntity,
  })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.opportunitiesService.create(createOpportunityDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar oportunidades con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de oportunidades',
  })
  findAll(@Query() query: QueryOpportunityDto) {
    return this.opportunitiesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.CEO, UserRole.DIR_COMERCIAL)
  @ApiOperation({ summary: 'Obtener estadísticas de oportunidades' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del pipeline',
  })
  getStats() {
    return this.opportunitiesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener oportunidad por ID' })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad encontrada',
    type: OpportunityEntity,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.opportunitiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.CEO,
    UserRole.DIR_COMERCIAL,
    UserRole.COMERCIAL,
  )
  @ApiOperation({ summary: 'Actualizar oportunidad' })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad actualizada',
    type: OpportunityEntity,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(id, updateOpportunityDto);
  }

  @Patch(':id/stage')
  @Roles(
    UserRole.ADMIN,
    UserRole.CEO,
    UserRole.DIR_COMERCIAL,
    UserRole.COMERCIAL,
  )
  @ApiOperation({ summary: 'Cambiar etapa del pipeline' })
  @ApiResponse({
    status: 200,
    description: 'Etapa actualizada',
    type: OpportunityEntity,
  })
  @ApiResponse({ status: 404, description: 'Oportunidad no encontrada' })
  @ApiResponse({ status: 400, description: 'Transición de etapa inválida' })
  updateStage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStageDto: UpdateStageDto,
  ) {
    return this.opportunitiesService.updateStage(id, updateStageDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CEO)
  @ApiOperation({ summary: 'Eliminar oportunidad' })
  @ApiResponse({
    status: 200,
    description: 'Oportunidad eliminada',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.opportunitiesService.remove(id);
  }
}



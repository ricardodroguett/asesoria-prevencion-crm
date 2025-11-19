import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PipelineStage, Phase, Segment } from '@prisma/client';

export class QueryOpportunityDto {
  @ApiPropertyOptional({
    enum: PipelineStage,
    description: 'Filtrar por etapa del pipeline',
  })
  @IsEnum(PipelineStage)
  @IsOptional()
  pipelineStage?: PipelineStage;

  @ApiPropertyOptional({
    enum: Phase,
    description: 'Filtrar por fase recomendada',
  })
  @IsEnum(Phase)
  @IsOptional()
  recommendedPhase?: Phase;

  @ApiPropertyOptional({
    enum: Segment,
    description: 'Filtrar por segmento',
  })
  @IsEnum(Segment)
  @IsOptional()
  segment?: Segment;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtrar por ID de empresa',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtrar por ID de responsable',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  ownerId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de resultados por página',
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}



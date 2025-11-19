import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Segment, Phase, PipelineStage } from '@prisma/client';

export class CreateOpportunityDto {
  @ApiProperty({
    example: 'Plan mensual F2 + TMERT',
    description: 'Título de la oportunidad',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Cliente requiere asesoría continua más protocolo TMERT',
    description: 'Descripción detallada',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la empresa asociada',
  })
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @ApiPropertyOptional({
    example: 'referido',
    description: 'Origen de la oportunidad (web, referido, terreno, etc.)',
  })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiPropertyOptional({
    enum: Segment,
    example: 'COLEGIO',
    description: 'Segmento del cliente',
  })
  @IsEnum(Segment)
  @IsOptional()
  segment?: Segment;

  @ApiPropertyOptional({
    enum: Phase,
    example: 'F2',
    description: 'Fase de servicio recomendada',
  })
  @IsEnum(Phase)
  @IsOptional()
  recommendedPhase?: Phase;

  @ApiPropertyOptional({
    enum: PipelineStage,
    example: 'DIAGNOSTICO',
    description: 'Etapa actual del pipeline',
    default: 'PROSPECCION',
  })
  @IsEnum(PipelineStage)
  @IsOptional()
  pipelineStage?: PipelineStage;

  @ApiPropertyOptional({
    example: 40,
    description: 'Probabilidad de cierre en porcentaje (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  probabilityPercent?: number;

  @ApiPropertyOptional({
    example: 850000,
    description: 'Monto estimado en CLP',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedAmountCLP?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario responsable',
  })
  @IsInt()
  @IsOptional()
  ownerId?: number;
}



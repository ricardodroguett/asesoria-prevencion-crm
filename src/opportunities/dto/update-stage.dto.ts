import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PipelineStage } from '@prisma/client';

export class UpdateStageDto {
  @ApiProperty({
    enum: PipelineStage,
    example: 'PROPUESTA',
    description: 'Nueva etapa del pipeline',
  })
  @IsEnum(PipelineStage)
  @IsNotEmpty()
  pipelineStage: PipelineStage;

  @ApiPropertyOptional({
    example: 'Cliente solicitó propuesta formal',
    description: 'Nota sobre el cambio de etapa',
  })
  @IsString()
  @IsOptional()
  note?: string;
}



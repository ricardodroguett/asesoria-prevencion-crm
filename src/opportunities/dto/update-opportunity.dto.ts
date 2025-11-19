import { PartialType } from '@nestjs/swagger';
import { CreateOpportunityDto } from './create-opportunity.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ApiPropertyOptional({
    example: '2025-11-20',
    description: 'Fecha de envío de propuesta',
  })
  @IsDateString()
  @IsOptional()
  proposalSentAt?: string;

  @ApiPropertyOptional({
    example: '2025-12-15',
    description: 'Fecha esperada de cierre',
  })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({
    example: 'precio',
    description: 'Motivo de pérdida (precio, sin_presupuesto, postergado, otro)',
  })
  @IsString()
  @IsOptional()
  lostReason?: string;
}



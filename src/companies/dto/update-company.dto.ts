import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CompanyStatus } from '@prisma/client';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiPropertyOptional({
    enum: CompanyStatus,
    example: 'ACTIVE',
    description: 'Estado del cliente',
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiPropertyOptional({
    example: '2025-01-15',
    description: 'Fecha de inicio del servicio',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-15',
    description: 'Fecha de renovación',
  })
  @IsDateString()
  @IsOptional()
  renewalDate?: string;
}



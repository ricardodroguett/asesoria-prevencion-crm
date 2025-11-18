import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Segment, CompanyStatus } from '@prisma/client';

export class QueryCompanyDto {
  @ApiPropertyOptional({
    example: 'Colegio',
    description: 'Buscar en razón social o nombre fantasía',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    enum: Segment,
    description: 'Filtrar por segmento',
  })
  @IsEnum(Segment)
  @IsOptional()
  segment?: Segment;

  @ApiPropertyOptional({
    enum: CompanyStatus,
    description: 'Filtrar por estado',
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: CompanyStatus;

  @ApiPropertyOptional({
    example: 'RM',
    description: 'Filtrar por región',
  })
  @IsString()
  @IsOptional()
  region?: string;

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



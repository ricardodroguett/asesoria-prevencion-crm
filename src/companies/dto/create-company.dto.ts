import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { Segment, Phase } from '@prisma/client';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Colegio San Martín Ltda.',
    description: 'Razón social de la empresa',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  businessName: string;

  @ApiPropertyOptional({
    example: 'Colegio San Martín',
    description: 'Nombre fantasía',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  tradeName?: string;

  @ApiPropertyOptional({
    example: '76.123.456-7',
    description: 'RUT de la empresa',
  })
  @IsString()
  @IsOptional()
  rut?: string;

  @ApiPropertyOptional({
    example: 'Educación',
    description: 'Rubro o industria',
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({
    enum: Segment,
    example: 'COLEGIO',
    description: 'Segmento de la empresa',
  })
  @IsEnum(Segment)
  @IsOptional()
  segment?: Segment;

  @ApiPropertyOptional({
    example: 35,
    description: 'Número de trabajadores',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  workersCount?: number;

  @ApiPropertyOptional({
    example: 'Av. Siempre Viva 123',
    description: 'Dirección',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: 'Santiago',
    description: 'Comuna',
  })
  @IsString()
  @IsOptional()
  commune?: string;

  @ApiPropertyOptional({
    example: 'RM',
    description: 'Región',
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({
    example: 'ACHS',
    description: 'Organismo administrador (ACHS, IST, Mutual, ISL)',
  })
  @IsString()
  @IsOptional()
  adminBody?: string;

  @ApiPropertyOptional({
    example: 'https://colegio.cl',
    description: 'Sitio web',
  })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre del contacto principal',
  })
  @IsString()
  @IsOptional()
  mainContactName?: string;

  @ApiPropertyOptional({
    example: 'Encargado RRHH',
    description: 'Cargo del contacto',
  })
  @IsString()
  @IsOptional()
  mainContactRole?: string;

  @ApiPropertyOptional({
    example: 'jperez@colegio.cl',
    description: 'Email del contacto',
  })
  @IsEmail()
  @IsOptional()
  mainContactEmail?: string;

  @ApiPropertyOptional({
    example: '+56912345678',
    description: 'Teléfono del contacto',
  })
  @IsString()
  @IsOptional()
  mainContactPhone?: string;

  @ApiPropertyOptional({
    enum: Phase,
    example: 'F1',
    description: 'Fase actual del servicio',
  })
  @IsEnum(Phase)
  @IsOptional()
  currentPhase?: Phase;

  @ApiPropertyOptional({
    example: 'Plan mensual F2 + TMERT',
    description: 'Descripción de servicios vigentes',
  })
  @IsString()
  @IsOptional()
  currentServices?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario responsable (account owner)',
  })
  @IsInt()
  @IsOptional()
  accountOwnerId?: number;
}



import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Segment, Phase, CompanyStatus } from '@prisma/client';

export class CompanyEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  businessName: string;

  @ApiPropertyOptional()
  tradeName?: string;

  @ApiPropertyOptional()
  rut?: string;

  @ApiPropertyOptional()
  industry?: string;

  @ApiPropertyOptional({ enum: Segment })
  segment?: Segment;

  @ApiPropertyOptional()
  workersCount?: number;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  commune?: string;

  @ApiPropertyOptional()
  region?: string;

  @ApiPropertyOptional()
  adminBody?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  mainContactName?: string;

  @ApiPropertyOptional()
  mainContactRole?: string;

  @ApiPropertyOptional()
  mainContactEmail?: string;

  @ApiPropertyOptional()
  mainContactPhone?: string;

  @ApiPropertyOptional({ enum: Phase })
  currentPhase?: Phase;

  @ApiPropertyOptional()
  currentServices?: string;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  renewalDate?: Date;

  @ApiProperty({ enum: CompanyStatus })
  status: CompanyStatus;

  @ApiPropertyOptional()
  accountOwnerId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}



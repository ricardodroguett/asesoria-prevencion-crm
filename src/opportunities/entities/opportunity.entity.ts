import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Segment, Phase, PipelineStage } from '@prisma/client';

export class OpportunityEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  companyId: number;

  @ApiPropertyOptional()
  origin?: string;

  @ApiPropertyOptional({ enum: Segment })
  segment?: Segment;

  @ApiPropertyOptional({ enum: Phase })
  recommendedPhase?: Phase;

  @ApiProperty({ enum: PipelineStage })
  pipelineStage: PipelineStage;

  @ApiPropertyOptional()
  probabilityPercent?: number;

  @ApiPropertyOptional()
  estimatedAmountCLP?: number;

  @ApiPropertyOptional()
  proposalSentAt?: Date;

  @ApiPropertyOptional()
  expectedCloseDate?: Date;

  @ApiPropertyOptional()
  closedAt?: Date;

  @ApiPropertyOptional()
  lostReason?: string;

  @ApiPropertyOptional()
  ownerId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}



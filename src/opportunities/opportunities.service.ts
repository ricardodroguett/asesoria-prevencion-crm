import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { Prisma, PipelineStage } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createOpportunityDto: CreateOpportunityDto, userId?: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: createOpportunityDto.companyId },
    });
    if (!company) {
      throw new NotFoundException(
        `Empresa con ID ${createOpportunityDto.companyId} no encontrada`,
      );
    }

    const lastOpportunity = await this.prisma.opportunity.findFirst({
      orderBy: { id: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastOpportunity && lastOpportunity.code) {
      const lastNumber = parseInt(lastOpportunity.code.split('-')[1]);
      nextNumber = lastNumber + 1;
    }
    const code = `OPP-${nextNumber.toString().padStart(4, '0')}`;

    let probabilityPercent = createOpportunityDto.probabilityPercent;
    if (probabilityPercent === undefined || probabilityPercent === null) {
      const stage = createOpportunityDto.pipelineStage || 'PROSPECCION';
      probabilityPercent = this.getDefaultProbability(stage);
    }

    const ownerId = createOpportunityDto.ownerId || userId;

    const opportunity = await this.prisma.opportunity.create({
      data: {
        ...createOpportunityDto,
        code,
        probabilityPercent,
        ownerId,
        pipelineStage: createOpportunityDto.pipelineStage || 'PROSPECCION',
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            businessName: true,
            tradeName: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return opportunity;
  }

  async findAll(query: QueryOpportunityDto) {
    const {
      pipelineStage,
      recommendedPhase,
      segment,
      companyId,
      ownerId,
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.OpportunityWhereInput = {};
    if (pipelineStage) where.pipelineStage = pipelineStage;
    if (recommendedPhase) where.recommendedPhase = recommendedPhase;
    if (segment) where.segment = segment;
    if (companyId) where.companyId = companyId;
    if (ownerId) where.ownerId = ownerId;

    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              code: true,
              businessName: true,
              tradeName: true,
            },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      data: opportunities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            businessName: true,
            tradeName: true,
            segment: true,
            workersCount: true,
            region: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        activities: {
          select: {
            id: true,
            activityType: true,
            subject: true,
            activityDatetime: true,
            outcome: true,
          },
          orderBy: { activityDatetime: 'desc' },
          take: 10,
        },
        proposals: {
          select: {
            id: true,
            subtotal: true,
            iva: true,
            total: true,
            status: true,
            version: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException(`Oportunidad con ID ${id} no encontrada`);
    }

    return opportunity;
  }

  async update(id: number, updateOpportunityDto: UpdateOpportunityDto) {
    await this.findOne(id);

    if (updateOpportunityDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: updateOpportunityDto.companyId },
      });
      if (!company) {
        throw new NotFoundException(
          `Empresa con ID ${updateOpportunityDto.companyId} no encontrada`,
        );
      }
    }

    const opportunity = await this.prisma.opportunity.update({
      where: { id },
      data: {
        ...updateOpportunityDto,
        proposalSentAt: updateOpportunityDto.proposalSentAt
          ? new Date(updateOpportunityDto.proposalSentAt)
          : undefined,
        expectedCloseDate: updateOpportunityDto.expectedCloseDate
          ? new Date(updateOpportunityDto.expectedCloseDate)
          : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            businessName: true,
            tradeName: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return opportunity;
  }

  async updateStage(id: number, updateStageDto: UpdateStageDto) {
    const opportunity = await this.findOne(id);

    this.validateStageTransition(
      opportunity.pipelineStage,
      updateStageDto.pipelineStage,
    );

    const probabilityPercent = this.getDefaultProbability(
      updateStageDto.pipelineStage,
    );

    const closedAt =
      updateStageDto.pipelineStage === 'CIERRE_G' ||
      updateStageDto.pipelineStage === 'CIERRE_P'
        ? new Date()
        : undefined;

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: {
        pipelineStage: updateStageDto.pipelineStage,
        probabilityPercent,
        closedAt,
      },
      include: {
        company: {
          select: {
            id: true,
            code: true,
            businessName: true,
            tradeName: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.opportunity.delete({
      where: { id },
    });
    return {
      message: 'Oportunidad eliminada exitosamente',
    };
  }

  async getStats() {
    const [total, byStage, byPhase, totalValue] = await Promise.all([
      this.prisma.opportunity.count(),
      this.prisma.opportunity.groupBy({
        by: ['pipelineStage'],
        _count: true,
      }),
      this.prisma.opportunity.groupBy({
        by: ['recommendedPhase'],
        _count: true,
      }),
      this.prisma.opportunity.aggregate({
        _sum: {
          estimatedAmountCLP: true,
        },
        where: {
          pipelineStage: {
            notIn: ['CIERRE_P'],
          },
        },
      }),
    ]);

    return {
      total,
      byStage,
      byPhase,
      totalEstimatedValue: totalValue._sum.estimatedAmountCLP || 0,
    };
  }

  private getDefaultProbability(stage: PipelineStage): number {
    const probabilities = {
      PROSPECCION: 10,
      DIAGNOSTICO: 25,
      PROPUESTA: 50,
      SEGUIMIENTO: 70,
      CIERRE_G: 100,
      CIERRE_P: 0,
    };
    return probabilities[stage] || 10;
  }

  private validateStageTransition(
    currentStage: PipelineStage,
    newStage: PipelineStage,
  ): void {
    const stageOrder = [
      'PROSPECCION',
      'DIAGNOSTICO',
      'PROPUESTA',
      'SEGUIMIENTO',
      'CIERRE_G',
      'CIERRE_P',
    ];
    const currentIndex = stageOrder.indexOf(currentStage);
    const newIndex = stageOrder.indexOf(newStage);
    if (newIndex < currentIndex && newStage !== 'PROSPECCION') {
      console.warn(
        `Advertencia: Retroceso de etapa de ${currentStage} a ${newStage}`,
      );
    }
    if (
      newIndex - currentIndex > 2 &&
      newStage !== 'CIERRE_P' &&
      currentStage !== 'PROSPECCION'
    ) {
      throw new BadRequestException(
        'No se puede avanzar más de 2 etapas a la vez',
      );
    }
  }
}



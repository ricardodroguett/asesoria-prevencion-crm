import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { QueryCompanyDto } from './dto/query-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    if (createCompanyDto.rut) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { rut: createCompanyDto.rut },
      });
      if (existingCompany) {
        throw new ConflictException('Ya existe una empresa con ese RUT');
      }
    }

    const lastCompany = await this.prisma.company.findFirst({
      orderBy: { id: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastCompany && lastCompany.code) {
      const lastNumber = parseInt(lastCompany.code.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    const code = `CLI-${nextNumber.toString().padStart(4, '0')}`;

    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        code,
      },
      include: {
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return company;
  }

  async findAll(query: QueryCompanyDto) {
    const { search, segment, status, region, page = 1, limit = 10 } = query;

    const where: Prisma.CompanyWhereInput = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { tradeName: { contains: search, mode: 'insensitive' } },
        { rut: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (segment) {
      where.segment = segment;
    }

    if (status) {
      where.status = status;
    }

    if (region) {
      where.region = region;
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          accountOwner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        opportunities: {
          select: {
            id: true,
            code: true,
            title: true,
            pipelineStage: true,
            estimatedAmountCLP: true,
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          select: {
            id: true,
            activityType: true,
            subject: true,
            activityDatetime: true,
          },
          take: 5,
          orderBy: { activityDatetime: 'desc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);

    if (updateCompanyDto.rut) {
      const existingCompany = await this.prisma.company.findFirst({
        where: {
          rut: updateCompanyDto.rut,
          NOT: { id },
        },
      });

      if (existingCompany) {
        throw new ConflictException('Ya existe otra empresa con ese RUT');
      }
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: {
        ...updateCompanyDto,
        startDate: updateCompanyDto.startDate
          ? new Date(updateCompanyDto.startDate)
          : undefined,
        renewalDate: updateCompanyDto.renewalDate
          ? new Date(updateCompanyDto.renewalDate)
          : undefined,
      },
      include: {
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return company;
  }

  async remove(id: number) {
    await this.findOne(id);

    const company = await this.prisma.company.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    return {
      message: 'Empresa marcada como cerrada exitosamente',
      company,
    };
  }

  async getStats() {
    const [total, byStatus, bySegment, byPhase] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.company.groupBy({
        by: ['segment'],
        _count: true,
      }),
      this.prisma.company.groupBy({
        by: ['currentPhase'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus,
      bySegment,
      byPhase,
    };
  }
}



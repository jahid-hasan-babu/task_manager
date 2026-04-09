import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { Role, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, createdById: string) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || TaskStatus.TODO,
        assignedUserId: dto.assignedUserId || null,
        createdById,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    assignedUserId?: string;
    search?: string;
    userId?: string;
    userRole?: Role;
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      assignedUserId,
      search,
      userId,
      userRole,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Regular users can only see tasks assigned to them
    if (userRole === Role.USER && userId) {
      where.assignedUserId = userId;
    }

    if (status) where.status = status;
    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    try {
      return await this.prisma.task.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.assignedUserId !== undefined && {
            assignedUserId: dto.assignedUserId || null,
          }),
          ...(dto.dueDate !== undefined && {
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          }),
        },
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Task not found');
      throw e;
    }
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    userId: string,
    userRole: Role,
  ) {
    // For regular users: verify they own this task in the same update query
    if (userRole === Role.USER) {
      const task = await this.prisma.task.findUnique({
        where: { id },
        select: { assignedUserId: true },
      });
      if (!task) throw new NotFoundException('Task not found');
      if (task.assignedUserId !== userId) {
        throw new ForbiddenException(
          'You can only update status of tasks assigned to you',
        );
      }
    }

    try {
      return await this.prisma.task.update({
        where: { id },
        data: { status },
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Task not found');
      throw e;
    }
  }

  async assignTask(id: string, assignedUserId: string | null) {
    // Verify assigned user exists without a separate task lookup
    if (assignedUserId) {
      const user = await this.prisma.user.findUnique({
        where: { id: assignedUserId },
        select: { id: true },
      });
      if (!user) throw new NotFoundException('Assigned user not found');
    }

    try {
      return await this.prisma.task.update({
        where: { id },
        data: { assignedUserId },
        include: {
          assignedUser: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Task not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.task.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Task not found');
      throw e;
    }
  }
}

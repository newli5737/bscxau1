import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks() {
    return this.prisma.task.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTaskById(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task || !task.isActive) throw new BadRequestException('Nhiệm vụ không tồn tại');
    return task;
  }

  async completeTask(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) throw new BadRequestException('Nhiệm vụ không tồn tại');

    // Check if already completed
    const existing = await this.prisma.taskCompletion.findUnique({
      where: { userId_taskId: { userId, taskId } },
    });
    if (existing) throw new BadRequestException('Bạn đã hoàn thành nhiệm vụ này');

    return this.prisma.taskCompletion.create({
      data: { userId, taskId, status: 'pending' },
    });
  }

  async getUserTasks(userId: number) {
    return this.prisma.taskCompletion.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

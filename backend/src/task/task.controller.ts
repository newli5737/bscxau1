import { Controller, Get, Post, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getTasks() {
    return this.taskService.getTasks();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyTasks(@Req() req: any) {
    return this.taskService.getUserTasks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getTask(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.getTaskById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  completeTask(@Req() req: any, @Param('id', ParseIntPipe) taskId: number) {
    return this.taskService.completeTask(req.user.id, taskId);
  }
}

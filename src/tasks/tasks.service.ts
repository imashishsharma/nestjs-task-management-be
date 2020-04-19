import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { CreateTaskDTO } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { DeleteResult } from 'typeorm';
import { GetTaskFilterDTO } from './dto/get-task-filter.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  getTasks(filterDTO: GetTaskFilterDTO, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDTO, user);
  }

  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }

  // createTask(createTaskDTO: CreateTaskDTO): Task {
  //   const { title, description } = createTaskDTO;
  //   const task: Task = {
  //     title,
  //     description,
  //     status: TaskStatus.OPEN,
  //     id: uuid(),
  //   };
  //   this.tasks.push(task);
  //   return task;
  // }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDTO, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const foundTask = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!foundTask) {
      throw new NotFoundException(`Task with ID ${id} not found.`);
    }
    return foundTask;
  }

  // getTaskById(id: string): Task {
  //   const task = this.tasks.find(task => task.id === id);
  //   if (!task) {
  //     throw new NotFoundException(`Task with ID ${id} not found.`);
  //   }
  //   return task;
  // }

  async deleteTaskById(id: number, user: User): Promise<void> {
    const result: DeleteResult = await this.taskRepository.delete({
      id,
      userId: user.id,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
  // deleteTaskById(id: string): void {
  //   const foundTask = this.getTaskById(id);
  //   this.tasks = this.tasks.filter(task => task.id !== foundTask.id);
  // }

  async updateTaskStatus(
    id: number,
    newStatus: TaskStatus,
    user: User,
  ): Promise<Task> {
    const foundTask = await this.getTaskById(id, user);
    foundTask.status = newStatus;
    await foundTask.save();
    return foundTask;
  }
  // updateTaskStatus(id: string, newStatus: TaskStatus): Task {
  //   const task = this.getTaskById(id);
  //   task.status = newStatus;
  //   return task;
  // }
}

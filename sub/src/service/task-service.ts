import { z } from 'zod';
import { Status } from '../../generated/prisma';
import { dbClientPromise } from './db-service';

export const publisherSchema = z.object({
  timestamp: z.string().datetime(),
  projectId: z.string().max(100),
  body: z.object({
    taskTag: z.string().max(100).optional(),
    callbackUrl: z.string().url(),
    method: z.enum(['POST']),
    headers: z.object({
      Authorization: z.string(),
      'Content-Type': z
        .string()
        .regex(/^application\/json$/)
        .nullable()
        .optional(),
    }),
    body: z.string().max(10240), // 10kb max
  }),
});

export const deleteSchema = z.object({
  projectId: z.string().max(100),
  taskId: z.string().max(100),
});
type PublisherSchema = z.infer<typeof publisherSchema>;

const retrier = (
  fn: () => Promise<any>,
  retries: number,
  taskId: string
): Promise<boolean> => {
  return fn()
    .then(() => true)
    .catch((error) => {
      console.error(`Error occurred while calling task ${taskId}:`, error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        return retrier(fn, retries - 1, taskId);
      }
      return false;
    });
};

export class TaskService {
  static async createTask(
    data: PublisherSchema
  ): Promise<PublisherSchema & { taskId: string }> {
    const { projectId, body, timestamp } = data;
    const dbClient = await dbClientPromise;
    const random10Digits = Math.random().toString(10).substring(2, 9);
    const task = await dbClient.task.create({
      data: {
        projectId,
        taskDump: body,
        timeStamp: new Date(timestamp),
        tag: random10Digits,
      },
    });
    return {
      taskId: task.taskId,
      projectId: task.projectId,
      body: body,
      timestamp: task.timeStamp.toISOString(),
    };
  }

  static async getTask(taskId: string) {
    const dbClient = await dbClientPromise;
    const task = await dbClient.task.findUnique({
      where: {
        taskId,
      },
    });
    if (!task) {
      throw new Error('Task not found');
    }
    return this._toTask(task);
  }

  static _toTask(
    task: any
  ): PublisherSchema & { taskId: string; status: Status; isDeleted: boolean } {
    return {
      taskId: task.taskId,
      projectId: task.projectId,
      body: task.taskDump,
      timestamp: task.timeStamp.toISOString(),
      status: task.status,
      isDeleted: task.isDeleted,
    };
  }

  static async makeTaskStatus(taskId: string, status: Status) {
    const dbClient = await dbClientPromise;
    const task = await dbClient.task.update({
      where: {
        taskId,
      },
      data: {
        status: status,
      },
    });
    return task;
  }

  static async _makeTaskCall(task: PublisherSchema & { taskId: string }) {
    const url = task.body.callbackUrl;
    const method = task.body.method;
    const headers = task.body.headers;
    const body = task.body.body;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: body,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async triggerTask(taskId: string) {
    const task = await this.getTask(taskId);
    await this.makeTaskStatus(taskId, Status.PENDING);
    const response = await retrier(
      async () => {
        await this._makeTaskCall(task);
      },
      3,
      taskId
    );
    if (!response) {
      await this.makeTaskStatus(taskId, Status.FAILED);
      return;
    }
    await this.makeTaskStatus(taskId, Status.COMPLETED);
  }

  static async deleteTask(taskId: string) {
    const dbClient = await dbClientPromise;
    await dbClient.task.update({
      where: {
        taskId,
        status: Status.PENDING, // only allow delete if task is pending
      },
      data: {
        isDeleted: true,
      },
    });
    return;
  }
}

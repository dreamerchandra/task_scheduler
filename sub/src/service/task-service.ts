import { z } from 'zod';
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
type PublisherSchema = z.infer<typeof publisherSchema>;

export class TaskService {
  static async createTask(
    data: PublisherSchema
  ): Promise<PublisherSchema & { taskId: string }> {
    const { projectId, body, timestamp } = data;
    const dbClient = await dbClientPromise;
    const task = await dbClient.task.create({
      data: {
        projectId,
        taskDump: body,
        timeStamp: new Date(timestamp),
      },
    });
    return {
      taskId: task.taskId,
      projectId: task.projectId,
      body: body,
      timestamp: task.timeStamp.toISOString(),
    };
  }
}

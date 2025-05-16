import { APIGatewayProxyEvent } from 'aws-lambda';
import { TaskService } from '../service/task-service';

export const subscribeRoute = async (
  event: APIGatewayProxyEvent & {
    taskId: string;
  }
) => {
  const taskId = event.taskId || JSON.parse(event.body || '{}').taskId;
  await TaskService.triggerTask(taskId);

  return {
    statusCode: 200,
    body: 'done',
  };
};

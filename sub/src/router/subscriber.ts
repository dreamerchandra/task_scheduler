import { APIGatewayProxyEvent } from 'aws-lambda';
import { subscriberSchema, TaskService } from '../service/task-service';

export const subscribeRoute = async (event: APIGatewayProxyEvent) => {
  const { body } = event;
  const parsedBody = subscriberSchema.parse(JSON.parse(body || '{}'));
  await TaskService.triggerTask(parsedBody.taskId);

  return {
    statusCode: 200,
    body: 'done',
  };
};

import { putEvent } from '../service/event-bridge';
import { publisherSchema, TaskService } from '../service/task-service';
import { CustomAPIGatewayProxyEvent } from '../type';

export const publishRouter = async (event: CustomAPIGatewayProxyEvent) => {
  const { body } = event;
  const parsedBody = publisherSchema.parse(JSON.parse(body || '{}'));
  const task = await TaskService.createTask(parsedBody);

  try {
    const isoWithoutMills = new Date(parsedBody.timestamp)
      .toISOString()
      .split('.')[0];
    const result = await putEvent({
      Name: task.taskId,
      ScheduleExpression: `at(${isoWithoutMills})`,
      FlexibleTimeWindow: { Mode: 'OFF' },
      Target: {
        Arn: 'arn:aws:lambda:ap-south-1:435464651133:function:taskScheduler-subFunction-GFmu3KNy7VIW',
        RoleArn:
          'arn:aws:iam::435464651133:role/taskScheduler-subFunctionRole-GvGKIFlFPJ4B',
        RetryPolicy: {
          MaximumRetryAttempts: 3,
          MaximumEventAgeInSeconds: 60,
        },
        Input: JSON.stringify({
          taskId: task.taskId,
        }),
      },
    });
    console.log('EventBridge result:', JSON.stringify(result));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task scheduled via EventBridge',
        taskId: task.taskId,
      }),
    };
  } catch (error) {
    console.error('Error scheduling task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to schedule task',
        error: error instanceof Error ? error.message : error,
      }),
    };
  }
};

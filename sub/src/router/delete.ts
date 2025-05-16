import { deleteEvent } from '../service/event-bridge';
import { deleteSchema, TaskService } from '../service/task-service';
import { CustomAPIGatewayProxyEvent } from '../type';

export const deleteRoute = async (event: CustomAPIGatewayProxyEvent) => {
  const { body } = event;
  const parsedBody = deleteSchema.parse(JSON.parse(body || '{}'));

  try {
    const result = await deleteEvent({
      Name: parsedBody.taskId,
      GroupName: 'default',
    });
    await TaskService.deleteTask(parsedBody.taskId);
    console.log('EventBridge result:', JSON.stringify(result));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task deleted successfully',
        taskId: parsedBody.taskId,
      }),
    };
  } catch (error) {
    console.error('Error deleting task:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to schedule task',
        error: error instanceof Error ? error.message : error,
      }),
    };
  }
};

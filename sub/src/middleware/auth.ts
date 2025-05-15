import assert from 'assert';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ProjectService } from '../service/project-service';
import { CustomAPIGatewayProxyEvent } from '../type';

export const authenticate = async (
  event: APIGatewayProxyEvent
): Promise<CustomAPIGatewayProxyEvent> => {
  const Authorization = event.headers.Authorization;
  assert(Authorization, 'Authorization header is required');
  const token = Authorization.split(' ')[1];
  assert(token, 'Token is required');
  const project = await ProjectService.verifyProject(token);
  return {
    ...event,
    requestContext: {
      ...event.requestContext,
      project,
    },
  };
};

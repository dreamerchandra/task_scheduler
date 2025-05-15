import { APIGatewayProxyEvent } from 'aws-lambda';
import { Project } from '../generated/prisma';

export interface CustomAPIGatewayProxyEvent
  extends Omit<APIGatewayProxyEvent, 'requestContext'> {
  requestContext: APIGatewayProxyEvent['requestContext'] & {
    project: Project;
  };
}

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ZodError } from 'zod';
import './_prisma-assets';
import { HTTPError } from './src/helper/error-helper';
import { authenticate } from './src/middleware/auth';
import { publishRouter } from './src/router/publisher';
import { subscribeRoute } from './src/router/subscriber';
import { ProjectService } from './src/service/project-service';

const entryLogger = (event: APIGatewayProxyEvent) => {
  const requestId = event.requestContext?.requestId;
  const httpMethod = event.httpMethod;
  const path = event.path;
  const queryStringParameters = event.queryStringParameters;
  const body = event.body;
  console.log(
    `incoming request, httpMethod: ${httpMethod}; path: ${path}; requestId: ${requestId}; queryStringParameters: ${JSON.stringify(
      queryStringParameters
    )}; body: ${body}`
  );
};

const allowOnlyMethods = (
  event: APIGatewayProxyEvent,
  allowedMethods: 'POST' | 'GET' | 'PUT' | 'DELETE'
) => {
  const httpMethod = event.httpMethod;
  if (httpMethod !== allowedMethods) {
    console.error(
      `Method not allowed, httpMethod: ${httpMethod}; allowedMethods: ${allowedMethods}`
    );
    throw new HTTPError(405, 'Method not allowed');
  }
};

const errorHandler = (err: unknown) => {
  console.error('Error occurred:', err);
  if (err instanceof HTTPError) {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal server error';
    return {
      statusCode,
      body: JSON.stringify({
        message: message,
      }),
    };
  }
  if (err instanceof ZodError) {
    const statusCode = 400;
    const message = err.errors.map((e) => e.message).join(', ');
    return {
      statusCode,
      body: JSON.stringify({
        message: message,
      }),
    };
  }
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Internal server error',
    }),
  };
};

export const subscriber = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    entryLogger(event);
    return await subscribeRoute(event);
  } catch (err) {
    return errorHandler(err);
  }
};

export const publisher = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    entryLogger(event);
    const start = Date.now();
    allowOnlyMethods(event, 'POST');
    console.log('Step 1 start');
    const contextAwareEvent = await authenticate(event);
    console.log('Step 1 done', Date.now() - start, 'ms');
    return await publishRouter(contextAwareEvent);
  } catch (err) {
    return errorHandler(err);
  }
};

export const createProject = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    entryLogger(event);
    const contextAwareEvent = await authenticate(event);
    allowOnlyMethods(event, 'POST');
    if (!contextAwareEvent.requestContext.project.isSuperAdmin) {
      throw new HTTPError(404, 'Method not allowed');
    }
    const { clientName } = JSON.parse(event.body || '{}');
    const project = await ProjectService.createProject(clientName);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Project created successfully',
        projectId: project.projectId,
        clientName: project.clientName,
        clientSecret: project.clientSecret,
      }),
    };
  } catch (err) {
    return errorHandler(err);
  }
};

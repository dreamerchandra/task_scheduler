import { PrismaClient } from '../../generated/prisma';

import { env } from '../env';
const _dbClient: PrismaClient | null = null;

export const dbClientPromise = (async () => {
  if (_dbClient) {
    return _dbClient;
  }
  await env.DATABASE_URL;
  const client = new PrismaClient();
  console.log('Connecting to database...');
  return client;
})();

export const dbHealthCheck = async () => {
  const dbClient = await dbClientPromise;
  try {
    await dbClient.project.findFirst();
    console.log('Database connection is healthy');
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection error');
  }
};

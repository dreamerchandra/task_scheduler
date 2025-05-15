import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { HTTPError } from '../helper/error-helper';
import { dbClientPromise } from './db-service';

const verifyJwt = async (
  token: string
): Promise<{
  projectId: string;
  clientName: string;
  clientSecret: string;
}> => {
  const JWT_SECRET = await env.JWT_SECRET;
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err);
        reject(new Error('Token verification failed'));
      } else {
        resolve(
          decoded as {
            projectId: string;
            clientName: string;
            clientSecret: string;
          }
        );
      }
    });
  });
};

export class ProjectService {
  static async getProjectById(projectId: string) {
    const dbClient = await dbClientPromise;
    const project = await dbClient.project.findUnique({
      where: {
        projectId: projectId,
      },
    });
    return project;
  }

  static async verifyProject(token: string) {
    const decoded = await verifyJwt(token);
    if (!decoded) {
      throw new HTTPError(401, 'Unauthorized');
    }
    const { projectId, clientName, clientSecret } = decoded;
    const dbClient = await dbClientPromise;

    const projectSecret = await dbClient.projectSecret.findUnique({
      where: {
        projectId_clientName_clientSecret: {
          projectId,
          clientName,
          clientSecret,
        },
      },
      include: {
        project: true,
      },
    });
    console.log('authentication successful for ', projectSecret?.projectId);
    if (!projectSecret) {
      throw new HTTPError(401, 'Unauthorized');
    }
    return projectSecret.project;
  }

  static async createProject(clientName: string) {
    const dbClient = await dbClientPromise;

    const project = await dbClient.project.create({ data: {} });
    const randomHash = randomBytes(16).toString('hex');
    const JWT_SECRET = await env.JWT_SECRET;
    const secret = jwt.sign(
      {
        projectId: project.projectId,
        clientName: clientName,
        clientSecret: randomHash,
      },
      JWT_SECRET,
      {
        expiresIn: '50Yrs',
      }
    );
    const projectSecret = await dbClient.projectSecret.create({
      data: {
        clientName,
        projectId: project.projectId,
        clientSecret: randomHash,
      },
    });
    return {
      projectId: project.projectId,
      clientName: projectSecret.clientName,
      clientSecret: secret,
    };
  }
}

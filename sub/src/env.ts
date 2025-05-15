import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import assert from 'assert';

type Secret = {
  JWT_SECRET: string;
  DATABASE_URL: string;
};

const fetch = async () => {
  const secret_name = 'prod/task_scheduler';
  const client = new SecretsManagerClient({
    region: 'ap-south-1',
  });
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
    assert(response.SecretString, 'SecretString is required');
    return JSON.parse(response.SecretString) as Secret;
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }
};

const getSecret = (() => {
  let secret: Promise<Secret> | null = null;
  const _fetch = async () => {
    if (secret) {
      return secret;
    }
    secret = fetch().catch((error) => {
      secret = null;
      throw error;
    });
    return secret;
  };
  return _fetch();
})();

export const env = {
  get JWT_SECRET() {
    if (process.env.JWT_SECRET) {
      return Promise.resolve(process.env.JWT_SECRET);
    }
    return getSecret.then((secret) => secret.JWT_SECRET);
  },
  get DATABASE_URL() {
    if (process.env.DATABASE_URL) {
      return Promise.resolve(process.env.DATABASE_URL);
    }
    return getSecret.then((secret) => {
      process.env.DATABASE_URL = secret.DATABASE_URL;
      return secret.DATABASE_URL;
    });
  },
};

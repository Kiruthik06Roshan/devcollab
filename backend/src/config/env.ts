import 'dotenv/config';

function required(value: string | undefined, fallback?: string) {
  const resolved = value ?? fallback;
  if (!resolved) {
    throw new Error('Missing required environment variable');
  }

  return resolved;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required(process.env.MONGODB_URI, 'mongodb://127.0.0.1:27017/devcollab'),
  jwtSecret: required(process.env.JWT_SECRET, 'devcollab-development-secret'),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN ?? 'http://localhost:5173',
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'devcollab_token'
};
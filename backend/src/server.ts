import http from 'node:http';
import { app } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { attachSocketServer } from './config/socket';

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  attachSocketServer(server);

  server.listen(env.port, () => {
    console.log(`DevCollab API running on port ${env.port}`);
  });
}

void bootstrap();
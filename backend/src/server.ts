import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { attachSocketServer } from './config/socket.js';

async function bootstrap() {
  await connectDatabase();

  const server = http.createServer(app);
  attachSocketServer(server);

  server.listen(env.port, () => {
    console.log(`DevCollab API running on port ${env.port}`);
  });
}

void bootstrap();
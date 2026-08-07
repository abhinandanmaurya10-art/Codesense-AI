const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');

async function bootstrap() {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_CALLBACK_URL) {
    console.warn('[startup] GitHub OAuth is not fully configured. Set GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GITHUB_CALLBACK_URL. GitHub login will not work.');
  }
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    console.warn('[startup] Google OAuth is not fully configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL. Google login will not work.');
  }

  await connectDB();

  let server;
  const MAX_PORT_TRIES = 10;
  const startServer = (port, attempt = 0) => {
    server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`CodeSense AI API listening on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        if (attempt < MAX_PORT_TRIES) {
          const nextPort = port + 1;
          // eslint-disable-next-line no-console
          console.warn(`Port ${port} already in use — attempting ${nextPort}`);
          // remove error listener to avoid duplicate handlers when retrying
          server.removeAllListeners('error');
          startServer(nextPort, attempt + 1);
          return;
        }
        // Exhausted attempts — show a helpful message and exit non-zero so nodemon can wait.
        // eslint-disable-next-line no-console
        console.error(`Ports ${env.PORT}..${env.PORT + MAX_PORT_TRIES} are all in use. Exiting.`);
        process.exit(1);
      }
      // Unknown server error — surface and exit.
      // eslint-disable-next-line no-console
      console.error('Server error:', err);
      process.exit(1);
    });
  };

  startServer(env.PORT);

  const shutdown = (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    if (server && server.close) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

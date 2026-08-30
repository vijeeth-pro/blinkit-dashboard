import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5002', 10);

const server = app.listen(PORT, () => {
  console.log(`🚀 Blinkit BI Backend Server listening on http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is currently in use. Please terminate the process using port ${PORT} or check running Node servers.`);
    process.exit(1);
  } else {
    console.error('Server startup error:', err);
  }
});

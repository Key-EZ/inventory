import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { initMysql } from './db.js';

import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';
import assetsRouter from './routes/assets.js';
import repairsRouter from './routes/repairs.js';
import auditLogsRouter from './routes/auditLogs.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Public Auth Endpoints
app.use('/api', authRouter);

// Guard subsequent endpoints
app.use(authMiddleware);

// Protected Endpoints
app.use('/api/settings', settingsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/repairs', repairsRouter);
app.use('/api/audit-logs', auditLogsRouter);

initMysql()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

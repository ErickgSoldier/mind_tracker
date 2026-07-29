import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS dinâmica para produção e desenvolvimento
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root route to prevent Cannot GET /
app.get('/', (req, res) => {
  res.send('Mind Tracker API is running. Acesse o frontend na porta correspondente (ex: http://localhost:5173).');
});

// Backup endpoint
app.get('/api/export/backup', (req, res) => {
  const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
  res.download(dbPath, 'mind_tracker_backup.db');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

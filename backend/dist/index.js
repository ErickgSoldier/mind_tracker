"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Configuração CORS dinâmica para produção e desenvolvimento
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// API Routes
app.use('/api', routes_1.default);
// Root route to prevent Cannot GET /
app.get('/', (req, res) => {
    res.send('Mind Tracker API is running. Acesse o frontend na porta correspondente (ex: http://localhost:5173).');
});
// Backup endpoint
app.get('/api/export/backup', (req, res) => {
    const dbPath = path_1.default.resolve(__dirname, '../../prisma/dev.db');
    res.download(dbPath, 'mind_tracker_backup.db');
});
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

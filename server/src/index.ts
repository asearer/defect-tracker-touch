import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import defectRoutes from './routes/defects';
import analyticsRoutes from './routes/analytics';
import capaRoutes from './routes/capa';
import auditRoutes from './routes/audit';
import seedRoutes from './routes/seed';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow all for dev
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/capa', capaRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/seed', seedRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), service: 'defect-tracker-server' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

export default app;

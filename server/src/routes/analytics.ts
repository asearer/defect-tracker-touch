import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Basic KPIs
        const totalDefects = await prisma.defectLog.count();
        const openDefects = await prisma.defectLog.count({ where: { status: 'Open' } });
        const scrapCount = await prisma.defectLog.aggregate({
            where: { notes: { contains: 'Scrap', mode: 'insensitive' } }, // Simple logic for now, real world uses disposition codes
            _sum: { quantity: true },
        });

        // Recent Trend (Last 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const recent = await prisma.defectLog.groupBy({
            by: ['defectTypeId'],
            where: { timestamp: { gte: yesterday } },
            _sum: { quantity: true },
        });

        // We need to map defectTypeId to names
        const types = await prisma.defectType.findMany();
        const trend = recent.map(r => ({
            name: types.find(t => t.id === r.defectTypeId)?.description || 'Unknown',
            count: r._sum.quantity || 0,
        }));

        res.json({
            summary: {
                total: totalDefects,
                open: openDefects,
                scrap: scrapCount._sum.quantity || 0,
            },
            pareto: trend,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;

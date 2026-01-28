import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get Audit Logs (Admin/Quality)
router.get('/', authenticateToken, requireRole(['Admin', 'Quality', 'Supervisor']), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                user: { select: { name: true, role: true } },
            },
            orderBy: { timestamp: 'desc' },
            take: 100, // Limit to recent
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;

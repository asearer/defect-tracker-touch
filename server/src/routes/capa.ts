import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Create CAPA (Engineer/Quality)
router.post('/', authenticateToken, requireRole(['Engineer', 'Quality', 'Admin']), async (req, res) => {
    const { defectLogId, rootCauseCategory, why1, why2, why3, why4, why5, correctiveAction, assigneeId, dueDate } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const capa = await prisma.capa.create({
            data: {
                defectLogId,
                rootCauseCategory,
                why1, why2, why3, why4, why5,
                correctiveAction,
                assigneeId,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'Open',
            },
        });

        // Update defect status to Under Review or Contained if appropriate?
        // For now, just log audit
        await prisma.auditLog.create({
            data: {
                tableName: 'capa',
                recordId: capa.id,
                action: 'INSERT',
                changedBy: userId,
                newValues: capa as any,
            },
        });

        res.status(201).json(capa);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create CAPA' });
    }
});

// Get CAPA by Defect ID
router.get('/defect/:defectId', authenticateToken, async (req, res) => {
    try {
        const capa = await prisma.capa.findFirst({
            where: { defectLogId: req.params.defectId },
            include: {
                assignee: { select: { name: true } },
            },
        });
        res.json(capa);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch CAPA' });
    }
});

// Update CAPA
router.put('/:id', authenticateToken, requireRole(['Engineer', 'Quality', 'Admin']), async (req, res) => {
    const { id } = req.params;
    const { status, correctiveAction, rootCauseCategory, why1, why2, why3, why4, why5 } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const existing = await prisma.capa.findUnique({ where: { id } });
        const updated = await prisma.capa.update({
            where: { id },
            data: { status, correctiveAction, rootCauseCategory, why1, why2, why3, why4, why5 },
        });

        await prisma.auditLog.create({
            data: {
                tableName: 'capa',
                recordId: id,
                action: 'UPDATE',
                changedBy: userId,
                oldValues: existing as any,
                newValues: updated as any,
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update CAPA' });
    }
});

export default router;

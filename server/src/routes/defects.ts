import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Get Defect Types (Public/Auth for all)
router.get('/types', authenticateToken, async (req, res) => {
    const types = await prisma.defectType.findMany({ orderBy: { category: 'asc' } });
    res.json(types);
});

// Get Machines (Public/Auth for all)
router.get('/machines', authenticateToken, async (req, res) => {
    const machines = await prisma.machine.findMany({ orderBy: { name: 'asc' } });
    res.json(machines);
});

// Log a new Defect (Operator)
router.post('/', authenticateToken, async (req, res) => {
    // Operators and above can log
    const { machineId, station, defectTypeId, quantity, notes, imageUrl } = req.body;
    const operatorId = (req as any).user?.userId;

    try {
        const defect = await prisma.defectLog.create({
            data: {
                machineId,
                station,
                defectTypeId,
                quantity,
                notes,
                imageUrl,
                operatorId,
                status: 'Open',
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                tableName: 'defect_logs',
                recordId: defect.id,
                action: 'INSERT',
                changedBy: operatorId,
                newValues: defect as any,
            },
        });

        res.status(201).json(defect);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log defect' });
    }
});

// Get Defects (Filtered)
router.get('/', authenticateToken, async (req, res) => {
    const { status, machineId, dateFrom, dateTo } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (machineId) where.machineId = machineId;
    if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom) where.timestamp.gte = new Date(dateFrom as string);
        if (dateTo) where.timestamp.lte = new Date(dateTo as string);
    }

    try {
        const defects = await prisma.defectLog.findMany({
            where,
            include: {
                machine: true,
                defectType: true,
                operator: { select: { name: true } },
            },
            orderBy: { timestamp: 'desc' },
        });
        res.json(defects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch defects' });
    }
});

// Disposition/Update Defect (Quality/Supervisor)
router.put('/:id', authenticateToken, requireRole(['Quality', 'Supervisor', 'Engineer', 'Admin']), async (req, res) => {
    const { id } = req.params;
    const { status, notes, quantity } = req.body;
    const userId = (req as any).user?.userId;

    try {
        const existing = await prisma.defectLog.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Defect not found' });

        const updated = await prisma.defectLog.update({
            where: { id },
            data: { status, notes, quantity },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                tableName: 'defect_logs',
                recordId: id,
                action: 'UPDATE',
                changedBy: userId,
                oldValues: existing as any,
                newValues: updated as any,
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update defect' });
    }
});

export default router;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get Defect Types (Public/Auth for all)
router.get('/types', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const types = yield prisma_1.default.defectType.findMany({ orderBy: { category: 'asc' } });
    res.json(types);
}));
// Get Machines (Public/Auth for all)
router.get('/machines', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const machines = yield prisma_1.default.machine.findMany({ orderBy: { name: 'asc' } });
    res.json(machines);
}));
// Log a new Defect (Operator)
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Operators and above can log
    const { machineId, station, defectTypeId, quantity, notes, imageUrl } = req.body;
    const operatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const defect = yield prisma_1.default.defectLog.create({
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
        yield prisma_1.default.auditLog.create({
            data: {
                tableName: 'defect_logs',
                recordId: defect.id,
                action: 'INSERT',
                changedBy: operatorId,
                newValues: defect,
            },
        });
        res.status(201).json(defect);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log defect' });
    }
}));
// Get Defects (Filtered)
router.get('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, machineId, dateFrom, dateTo } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (machineId)
        where.machineId = machineId;
    if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom)
            where.timestamp.gte = new Date(dateFrom);
        if (dateTo)
            where.timestamp.lte = new Date(dateTo);
    }
    try {
        const defects = yield prisma_1.default.defectLog.findMany({
            where,
            include: {
                machine: true,
                defectType: true,
                operator: { select: { name: true } },
            },
            orderBy: { timestamp: 'desc' },
        });
        res.json(defects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch defects' });
    }
}));
// Disposition/Update Defect (Quality/Supervisor)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Quality', 'Supervisor', 'Engineer', 'Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { status, notes, quantity } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const existing = yield prisma_1.default.defectLog.findUnique({ where: { id } });
        if (!existing)
            return res.status(404).json({ error: 'Defect not found' });
        const updated = yield prisma_1.default.defectLog.update({
            where: { id },
            data: { status, notes, quantity },
        });
        // Audit Log
        yield prisma_1.default.auditLog.create({
            data: {
                tableName: 'defect_logs',
                recordId: id,
                action: 'UPDATE',
                changedBy: userId,
                oldValues: existing,
                newValues: updated,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update defect' });
    }
}));
exports.default = router;

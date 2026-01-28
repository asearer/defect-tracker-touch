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
// Create CAPA (Engineer/Quality)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['Engineer', 'Quality', 'Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { defectLogId, rootCauseCategory, why1, why2, why3, why4, why5, correctiveAction, assigneeId, dueDate } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const capa = yield prisma_1.default.capa.create({
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
        yield prisma_1.default.auditLog.create({
            data: {
                tableName: 'capa',
                recordId: capa.id,
                action: 'INSERT',
                changedBy: userId,
                newValues: capa,
            },
        });
        res.status(201).json(capa);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create CAPA' });
    }
}));
// Get CAPA by Defect ID
router.get('/defect/:defectId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const capa = yield prisma_1.default.capa.findFirst({
            where: { defectLogId: req.params.defectId },
            include: {
                assignee: { select: { name: true } },
            },
        });
        res.json(capa);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch CAPA' });
    }
}));
// Update CAPA
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)(['Engineer', 'Quality', 'Admin']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { status, correctiveAction, rootCauseCategory, why1, why2, why3, why4, why5 } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const existing = yield prisma_1.default.capa.findUnique({ where: { id } });
        const updated = yield prisma_1.default.capa.update({
            where: { id },
            data: { status, correctiveAction, rootCauseCategory, why1, why2, why3, why4, why5 },
        });
        yield prisma_1.default.auditLog.create({
            data: {
                tableName: 'capa',
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
        res.status(500).json({ error: 'Failed to update CAPA' });
    }
}));
exports.default = router;

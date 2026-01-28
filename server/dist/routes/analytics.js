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
router.get('/dashboard', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Basic KPIs
        const totalDefects = yield prisma_1.default.defectLog.count();
        const openDefects = yield prisma_1.default.defectLog.count({ where: { status: 'Open' } });
        const scrapCount = yield prisma_1.default.defectLog.aggregate({
            where: { notes: { contains: 'Scrap', mode: 'insensitive' } }, // Simple logic for now, real world uses disposition codes
            _sum: { quantity: true },
        });
        // Recent Trend (Last 24h)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const recent = yield prisma_1.default.defectLog.groupBy({
            by: ['defectTypeId'],
            where: { timestamp: { gte: yesterday } },
            _sum: { quantity: true },
        });
        // We need to map defectTypeId to names
        const types = yield prisma_1.default.defectType.findMany();
        const trend = recent.map(r => {
            var _a;
            return ({
                name: ((_a = types.find(t => t.id === r.defectTypeId)) === null || _a === void 0 ? void 0 : _a.description) || 'Unknown',
                count: r._sum.quantity || 0,
            });
        });
        res.json({
            summary: {
                total: totalDefects,
                open: openDefects,
                scrap: scrapCount._sum.quantity || 0,
            },
            pareto: trend,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}));
exports.default = router;

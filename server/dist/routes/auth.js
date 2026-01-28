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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdefaultkey';
// Login
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
}));
// Seed Initial Users (For Demo Convenience)
router.post('/seed-users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = [
        { name: 'Operator One', email: 'op1@factory.com', role: 'Operator', password: 'password' },
        { name: 'Quality Jane', email: 'quality@factory.com', role: 'Quality', password: 'password' },
        { name: 'Supervisor Sam', email: 'super@factory.com', role: 'Supervisor', password: 'password' },
        { name: 'Engineer Ed', email: 'eng@factory.com', role: 'Engineer', password: 'password' },
        { name: 'Admin Alice', email: 'admin@factory.com', role: 'Admin', password: 'password' },
    ];
    try {
        for (const u of users) {
            const hash = yield bcryptjs_1.default.hash(u.password, 10);
            yield prisma_1.default.user.upsert({
                where: { email: u.email },
                update: {},
                create: {
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    passwordHash: hash,
                },
            });
        }
        res.json({ message: 'Demo users seeded' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Seeding failed' });
    }
}));
exports.default = router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

const router = Router();

// Helper to generate random date within last N days
function randomDate(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * days));
    date.setHours(Math.floor(Math.random() * 24));
    return date;
}

router.post('/demo', async (req, res) => {
    try {
        console.log('Starting demo data seed...');

        // 1. Clean up existing data (optional: use with caution in prod)
        // In a real app, you'd protect this with a specific ENV var or admin check
        await prisma.capa.deleteMany({});
        await prisma.auditLog.deleteMany({});
        await prisma.defectLog.deleteMany({});
        await prisma.defectType.deleteMany({});
        await prisma.machine.deleteMany({});
        await prisma.user.deleteMany({});

        // 2. Seed Users
        const users = [
            { name: 'Operator One', email: 'op1@factory.com', role: 'Operator', password: 'password' },
            { name: 'Quality Jane', email: 'quality@factory.com', role: 'Quality', password: 'password' },
            { name: 'Supervisor Sam', email: 'super@factory.com', role: 'Supervisor', password: 'password' },
            { name: 'Engineer Ed', email: 'eng@factory.com', role: 'Engineer', password: 'password' },
            { name: 'Admin Alice', email: 'admin@factory.com', role: 'Admin', password: 'password' },
        ];

        const createdUsers = [];
        for (const u of users) {
            const hash = await bcrypt.hash(u.password, 10);
            const user = await prisma.user.create({
                data: {
                    name: u.name,
                    email: u.email,
                    role: u.role as any,
                    passwordHash: hash,
                },
            });
            createdUsers.push(user);
        }

        // 3. Seed Machines
        const machineData = [
            { name: 'Line 1 - Assembly', location: 'Building A', status: 'Active' },
            { name: 'Line 2 - Painting', location: 'Building B', status: 'Active' },
            { name: 'Press 004', location: 'Building A', status: 'Maintenance' },
            { name: 'Welding Station 3', location: 'Building C', status: 'Active' },
        ];

        const createdMachines = [];
        for (const m of machineData) {
            const machine = await prisma.machine.create({ data: m });
            createdMachines.push(machine);
        }

        // 4. Seed Defect Types
        const defectTypesData = [
            { category: 'Cosmetic', code: 'SCR-01', description: 'Surface Scratch' },
            { category: 'Dimensional', code: 'DIM-05', description: 'Length Out of Spec' },
            { category: 'Assembly', code: 'MIS-02', description: 'Missing Washer' },
            { category: 'Material', code: 'MAT-09', description: 'Material Deformation' },
            { category: 'Process', code: 'WLD-03', description: 'Incomplete Weld' },
        ];

        const createdDefectTypes = [];
        for (const d of defectTypesData) {
            const dt = await prisma.defectType.create({ data: d });
            createdDefectTypes.push(dt);
        }

        // 5. Generate Defect Logs (Historical Data)
        // Generate ~50 defects over the last 30 days
        const defectLogs = [];
        const operators = createdUsers.filter(u => u.role === 'Operator' || u.role === 'Quality');

        for (let i = 0; i < 50; i++) {
            const randomMachine = createdMachines[Math.floor(Math.random() * createdMachines.length)];
            const randomDefectType = createdDefectTypes[Math.floor(Math.random() * createdDefectTypes.length)];
            const randomUser = operators[Math.floor(Math.random() * operators.length)];

            // Bias towards recent dates for "Top Defects (24h)"
            const isRecent = Math.random() > 0.7;
            const date = isRecent ? randomDate(1) : randomDate(30);

            const statusDist = Math.random();
            let status = 'Open';
            if (statusDist > 0.5) status = 'Closed';
            else if (statusDist > 0.3) status = 'Contained';

            await prisma.defectLog.create({
                data: {
                    timestamp: date,
                    machineId: randomMachine.id,
                    defectTypeId: randomDefectType.id,
                    operatorId: randomUser.id,
                    quantity: Math.floor(Math.random() * 5) + 1,
                    status: status as any,
                    notes: `Auto-generated demo defect log #${i + 1}`,
                    station: `Station ${Math.floor(Math.random() * 10)}`
                }
            });
        }

        res.json({
            message: 'Demo mode activated: Data seeded successfully',
            stats: {
                users: createdUsers.length,
                machines: createdMachines.length,
                defectTypes: createdDefectTypes.length,
                logs: 50
            }
        });

    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ error: 'Failed to seed demo data' });
    }
});

export default router;

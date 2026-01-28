"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const defects_1 = __importDefault(require("./routes/defects"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const capa_1 = __importDefault(require("./routes/capa"));
const audit_1 = __importDefault(require("./routes/audit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)()); // Allow all for dev
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/defects', defects_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/capa', capa_1.default);
app.use('/api/audit', audit_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), service: 'defect-tracker-server' });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

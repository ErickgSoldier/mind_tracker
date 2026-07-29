"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services = __importStar(require("./services"));
const router = (0, express_1.Router)();
router.post('/records', async (req, res) => {
    try {
        const record = await services.createRecord(req.body);
        res.json(record);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create record' });
    }
});
router.get('/records', async (req, res) => {
    try {
        const filter = req.query.filter || 'all';
        const records = await services.getRecords(filter);
        res.json(records);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch records' });
    }
});
router.get('/analytics/dashboard', async (req, res) => {
    try {
        const stats = await services.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
router.get('/analytics/insights', async (req, res) => {
    try {
        const analytics = await services.getAnalytics();
        res.json(analytics);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
router.get('/settings', async (req, res) => {
    try {
        const settings = await services.getSettings();
        res.json(settings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});
router.put('/settings', async (req, res) => {
    try {
        const settings = await services.updateSettings(req.body);
        res.json(settings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
// Extra routes for Export could be added here
router.get('/export/json', async (req, res) => {
    try {
        const records = await services.getRecords('all');
        res.header("Content-Type", 'application/json');
        res.attachment("mind_tracker_export.json");
        res.send(JSON.stringify(records, null, 2));
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to export JSON' });
    }
});
exports.default = router;

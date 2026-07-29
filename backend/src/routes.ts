import { Router } from 'express';
import * as services from './services';

const router = Router();

router.post('/records', async (req, res) => {
  try {
    const record = await services.createRecord(req.body);
    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

router.get('/records', async (req, res) => {
  try {
    const filter = req.query.filter as string || 'all';
    const records = await services.getRecords(filter);
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.get('/analytics/dashboard', async (req, res) => {
  try {
    const stats = await services.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

router.get('/analytics/insights', async (req, res) => {
  try {
    const analytics = await services.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await services.getSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const settings = await services.updateSettings(req.body);
    res.json(settings);
  } catch (error) {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to export JSON' });
  }
});

export default router;

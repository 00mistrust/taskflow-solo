const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

async function logActivity(action, projectId, userId) {
  try {
    await Activity.create({ action, project: projectId, user: userId });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

router.get('/:id/activities', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ project: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    const formatted = activities.map(a => ({
      message: `${a.user.name} — ${a.action}`,
      date: a.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, logActivity };

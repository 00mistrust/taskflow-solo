const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    // Count active projects owned by the user
    const activeProjects = await Project.countDocuments({ 
      owner: userId, 
      status: 'actif' 
    });

    // Aggregate task metrics
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: new require('mongoose').Types.ObjectId(userId) } },
      { $group: {
        _id: null,
        totalAssigned: { $sum: 1 },
        totalDone: { $sum: { $cond: [{ $eq: ['$status', 'terminé'] }, 1, 0] } },
        totalLate: { $sum: { $cond: [
          { $and: [
            { $lt: ['$deadline', now] },
            { $ne: ['$status', 'terminé'] }
          ]}, 1, 0
        ]}}
      }}
    ]);

    // Tasks in progress sorted by priority then deadline
    const inProgress = await Task.find({
      assignedTo: userId,
      status: 'en cours'
    })
    .sort({ priority: -1, deadline: 1 })
    .populate('project', 'title');

    const stats = taskStats[0] || { totalAssigned: 0, totalDone: 0, totalLate: 0 };

    res.json({
      activeProjects,
      totalAssigned: stats.totalAssigned,
      totalDone: stats.totalDone,
      totalLate: stats.totalLate,
      inProgress
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

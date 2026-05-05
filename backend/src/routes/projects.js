const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// All routes here are protected by the auth middleware
router.use(auth);

// ─── GET ALL PROJECTS (with pagination) ─────────────────
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Project.countDocuments({ owner: req.user.userId });
    const projects = await Project.find({ owner: req.user.userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ data: projects, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET ONE PROJECT ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── CREATE PROJECT ──────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const project = await Project.create({
      title,
      description,
      deadline,
      owner: req.user.userId
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── UPDATE PROJECT ──────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── DELETE PROJECT ──────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

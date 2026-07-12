const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const ResumeTip = require('../models/ResumeTip');

router.get('/today', verifyToken, async (req, res, next) => {
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    const tip = await ResumeTip.findOne({ dateKey, status: 'published' }).lean();
    if (!tip) return res.status(404).json({ message: 'No resume tip for today yet' });
    res.json(tip);
  } catch (err) { next(err); }
});

module.exports = router;

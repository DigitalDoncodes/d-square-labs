const router = require('express').Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/User');
const { getAll, get } = require('../modules/registry');

router.use(verifyToken);

router.get('/', (req, res, next) => {
  try {
    const all = getAll().map((m) => ({
      slug: m.slug,
      name: m.name,
      version: m.version,
      description: m.description,
      features: m.features,
    }));
    res.json(all);
  } catch (err) { next(err); }
});

router.get('/my', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('programs activeProgram').lean();
    res.json({ programs: user?.programs || ['general'], activeProgram: user?.activeProgram || 'general' });
  } catch (err) { next(err); }
});

router.post('/enroll', async (req, res, next) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ message: 'Program slug is required' });
    if (!get(slug)) return res.status(404).json({ message: `Program "${slug}" not found` });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { programs: slug } },
      { new: true, select: 'programs activeProgram' }
    );
    res.json({ programs: user.programs, activeProgram: user.activeProgram });
  } catch (err) { next(err); }
});

router.post('/switch', async (req, res, next) => {
  try {
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ message: 'Program slug is required' });
    if (!get(slug)) return res.status(404).json({ message: `Program "${slug}" not found` });

    const user = await User.findOneAndUpdate(
      { _id: req.user.userId, programs: slug },
      { activeProgram: slug },
      { new: true }
    );
    if (!user) return res.status(400).json({ message: 'You are not enrolled in this program' });

    const freshToken = jwt.sign(
      { userId: user._id, name: user.name, email: user.email, role: user.role, tier: user.tier, studentType: user.studentType, programs: user.programs, activeProgram: user.activeProgram },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ programs: user.programs, activeProgram: user.activeProgram, token: freshToken });
  } catch (err) { next(err); }
});

module.exports = router;

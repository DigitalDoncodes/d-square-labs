const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const {
  getToday,
  solveCase,
  listCases,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/dailyCaseController');

router.use(verifyToken);

router.get('/today', getToday);
router.post('/:id/solve', solveCase);

router.get('/', checkRole('admin'), listCases);
router.post('/', checkRole('admin'), createCase);
router.put('/:id', checkRole('admin'), updateCase);
router.delete('/:id', checkRole('admin'), deleteCase);

module.exports = router;

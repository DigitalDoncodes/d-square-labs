const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const checkTier = require('../middleware/checkTier');
const {
  listCompanies,
  getCompanyBySlug,
  listQuestions,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');
const { getCompanyNews } = require('../controllers/companyNewsController');

router.use(verifyToken);

router.get('/', listCompanies);
router.get('/questions/bank', checkTier('pro'), listQuestions);
router.get('/news/feed', getCompanyNews);
router.get('/:slug', getCompanyBySlug);

router.post('/', checkRole('admin'), createCompany);
router.put('/:id', checkRole('admin'), updateCompany);
router.delete('/:id', checkRole('admin'), deleteCompany);

module.exports = router;

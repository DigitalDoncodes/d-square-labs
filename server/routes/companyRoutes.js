const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const {
  listCompanies,
  getCompanyBySlug,
  createCompany,
  updateCompany,
  deleteCompany,
} = require('../controllers/companyController');

router.use(verifyToken);

router.get('/', listCompanies);
router.get('/:slug', getCompanyBySlug);

router.post('/', checkRole('admin'), createCompany);
router.put('/:id', checkRole('admin'), updateCompany);
router.delete('/:id', checkRole('admin'), deleteCompany);

module.exports = router;

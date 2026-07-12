const router = require('express').Router();
const c = require('../controllers/placementController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.listDrives);
router.post('/', c.createDrive);
router.put('/:id', c.updateDrive);
router.delete('/:id', c.deleteDrive);
router.post('/:id/apply', c.applyToDrive);
router.get('/my-applications', c.listMyApplications);
router.put('/my-applications/:appId', c.updateMyApplication);

module.exports = router;

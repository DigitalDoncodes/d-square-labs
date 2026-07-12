const router = require('express').Router();
const c = require('../controllers/resourceController');
const verifyToken = require('../middleware/verifyToken');
const docUpload = require('../middleware/docUpload');

router.use(verifyToken);
router.get('/', c.list);
router.post('/', c.create);
router.post('/upload', docUpload.single('file'), c.uploadFile);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/:id/download', c.incrementDownload);

module.exports = router;

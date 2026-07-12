const router = require('express').Router();
const c = require('../controllers/internshipController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

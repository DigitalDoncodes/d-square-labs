const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const c = require('../controllers/starStoryController');

router.use(verifyToken);
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

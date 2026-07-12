const router = require('express').Router();
const c = require('../controllers/marketplaceController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.list);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.put('/:id/sold', c.markSold);

module.exports = router;

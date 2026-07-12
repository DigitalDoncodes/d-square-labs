const router = require('express').Router();
const c = require('../controllers/skillController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.listListings);
router.post('/', c.createListing);
router.put('/:id', c.updateListing);
router.delete('/:id', c.deleteListing);
router.post('/:id/rate', c.addRating);

module.exports = router;

const router = require('express').Router();
const c = require('../controllers/feedController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.getFeed);
router.post('/', c.createPost);
router.post('/:id/react', c.reactToPost);
router.post('/:id/vote/:optionIdx', c.votePoll);

module.exports = router;

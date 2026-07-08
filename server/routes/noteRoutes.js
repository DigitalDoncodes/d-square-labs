const router = require('express').Router();
const {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', listNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;

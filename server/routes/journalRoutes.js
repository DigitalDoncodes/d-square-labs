const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const {
  listJournal,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} = require('../controllers/journalController');

// All journal routes are member-accessible; entries are scoped to req.user.userId.
router.use(verifyToken);

router.get('/', listJournal);
router.post('/', createJournalEntry);
router.put('/:id', updateJournalEntry);
router.delete('/:id', deleteJournalEntry);

module.exports = router;

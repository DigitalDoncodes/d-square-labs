const router = require('express').Router();
const c = require('../controllers/eventController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);
router.get('/', c.listEvents);
router.post('/', c.createEvent);
router.put('/:id', c.updateEvent);
router.delete('/:id', c.deleteEvent);
router.post('/:id/rsvp', c.rsvpEvent);
router.get('/:id/attendees', c.getEventAttendees);
router.get('/my-rsvps', c.getMyRSVPs);

module.exports = router;

const Event = require('../../models/Event');
const EventRSVP = require('../../models/EventRSVP');
const { notify } = require('../../controllers/notificationController');

async function sendRsvpReminders() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const events = await Event.find({ date: { $gte: now, $lte: in24h } }).select('_id title date').lean();
  if (!events.length) return;

  for (const event of events) {
    const rsvps = await EventRSVP.find({ event: event._id, status: 'going' }).select('user').lean();
    const timeFmt = new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    for (const rsvp of rsvps) {
      await notify({ user: rsvp.user, type: 'rsvp', title: `Reminder: ${event.title} is tomorrow`, body: `Starting at ${timeFmt}`, link: '/community/events' }).catch(() => {});
    }
  }
  console.log(`[rsvp-reminder] Sent reminders for ${events.length} upcoming event(s)`);
}

module.exports = { sendRsvpReminders };

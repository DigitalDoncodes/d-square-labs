const User = require('../../models/User');
const { notify } = require('../../controllers/notificationController');

async function sendTrialExpiryReminders() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  // Expiring in ~3 days
  const expiringSoon = await User.find({
    tier: { $in: ['trial', 'pro', 'max'] },
    tierExpiresAt: { $gte: in3Days, $lt: in4Days },
  }).select('_id name tier tierExpiresAt').lean();

  for (const user of expiringSoon) {
    const expFmt = new Date(user.tierExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    await notify({ user: user._id, type: 'subscription', title: `Your ${user.tier} plan expires on ${expFmt}`, body: 'Renew now to keep your access', link: '/subscribe' }).catch(() => {});
  }

  // Just expired (within last 24h)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const justExpired = await User.find({
    tier: { $in: ['trial', 'pro', 'max'] },
    tierExpiresAt: { $gte: yesterday, $lt: now },
  }).select('_id name tier').lean();

  for (const user of justExpired) {
    await notify({ user: user._id, type: 'subscription', title: `Your ${user.tier} plan has expired`, body: 'Upgrade again to regain Pro access', link: '/subscribe' }).catch(() => {});
    await User.findByIdAndUpdate(user._id, { tier: 'free', tierExpiresAt: null }).catch(() => {});
  }

  console.log(`[trial-expiry] Expiring soon: ${expiringSoon.length}, just expired: ${justExpired.length}`);
}

module.exports = { sendTrialExpiryReminders };

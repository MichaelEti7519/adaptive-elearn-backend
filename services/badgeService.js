const Badge = require('../models/Badge');
const Attempt = require('../models/Attempt');

async function checkBadges(user) {
  // example: awarding a 50-points badge
  if (user.points >= 50) {
    const badge = await Badge.findOne({ name: 'Getting Started' });
    if (badge && !user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
    }
  }

  // example: first correct answer badge
  const correctAttempts = await Attempt.countDocuments({ student: user._id, correct: true });
  if (correctAttempts >= 1) {
    const badge = await Badge.findOne({ name: 'First Win' });
    if (badge && !user.badges.includes(badge._id)) {
      user.badges.push(badge._id);
    }
  }

  // caller should save user after badge updates
}
module.exports = { checkBadges };

const User = require('../models/User');

exports.leaderboard = async (req, res) => {
  try {
    const top = await User.find().sort({ points: -1 }).limit(10).select('name points level badges');
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

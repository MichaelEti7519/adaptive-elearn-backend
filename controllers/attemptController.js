const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const User = require('../models/User');
const adaptiveService = require('../services/adaptiveService');
const badgeService = require('../services/badgeService');

exports.submitAttempt = async (req, res) => {
  const { questionId, givenAnswer } = req.body;
  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    let correct = false;
    if (question.type === 'mcq') {
      // mcq: givenAnswer should be the choice text
      const correctChoice = question.choices.find(c => c.correct);
      correct = correctChoice && correctChoice.text === givenAnswer;
    } else {
      correct = String(question.answer || '').trim().toLowerCase() === String(givenAnswer || '').trim().toLowerCase();
    }

    const pointsEarned = correct ? question.points : 0;
    const attempt = new Attempt({
      student: req.user._id,
      question: question._id,
      correct,
      givenAnswer,
      pointsEarned
    });
    await attempt.save();

    // update user object
    const user = await User.findById(req.user._id);
    if (pointsEarned) {
      user.points += pointsEarned;
      user.level = Math.floor(user.points / 100) + 1;
    }

    // update mastery per concept
    await adaptiveService.updateMastery(user, question.concepts, correct, question.difficulty);

    // check badges (may push badge ids)
    await badgeService.checkBadges(user);

    await user.save();

    res.json({ attempt, user: { points: user.points, level: user.level, mastery: user.mastery } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttemptsForStudent = async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.params.studentId }).populate('question');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

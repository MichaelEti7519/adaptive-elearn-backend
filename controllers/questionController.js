const Question = require('../models/Question');
const Lesson = require('../models/Lesson');
const adaptiveService = require('../services/adaptiveService');

exports.createQuestion = async (req, res) => {
  const { text, type, choices, answer, difficulty, concepts, lessonId, points } = req.body;
  try {
    const question = new Question({ text, type, choices, answer, difficulty, concepts, points });
    await question.save();
    if (lessonId) await Lesson.findByIdAndUpdate(lessonId, { $push: { questions: question._id } });
    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNextQuestion = async (req, res) => {
  try {
    const q = await adaptiveService.selectNextQuestionForUser(req.user);
    if (!q) return res.status(404).json({ message: 'No question found' });
    res.json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const Question = require('../models/Question');

const BASE_INCR = 8;
const BASE_DECR = 4;

async function updateMastery(user, concepts = [], correct, difficulty = 2) {
  concepts.forEach(c => {
    const prev = user.mastery.get(c) ?? 50;
    const delta = correct ? Math.round(BASE_INCR * (1 + difficulty / 5)) : -BASE_DECR;
    let updated = prev + delta;
    if (updated > 100) updated = 100;
    if (updated < 0) updated = 0;
    user.mastery.set(c, updated);
  });
  // don't save the user here - caller will save
  return user.mastery;
}

async function selectNextQuestionForUser(user) {
  // find weakest concept
  let weakest = null;
  let weakestScore = 101;
  for (const [concept, score] of user.mastery.entries()) {
    if (score < weakestScore) {
      weakestScore = score;
      weakest = concept;
    }
  }

  if (!weakest) {
    // no mastery recorded -> pick an easy, random question
    return await Question.findOne({ difficulty: { $lte: 2 } }).sort({ createdAt: 1 }).exec();
  }

  // map mastery to difficulty
  let targetDifficulty = Math.ceil((weakestScore / 100) * 5);
  if (targetDifficulty < 2) targetDifficulty = 2;

  let q = await Question.findOne({
    concepts: weakest,
    difficulty: { $gte: Math.max(1, targetDifficulty - 1), $lte: Math.min(5, targetDifficulty + 1) }
  }).exec();

  if (q) return q;
  // fallback - any question on the weakest concept
  q = await Question.findOne({ concepts: weakest }).exec();
  if (q) return q;
  // final fallback - any question
  return await Question.findOne().exec();
}

module.exports = { updateMastery, selectNextQuestionForUser };

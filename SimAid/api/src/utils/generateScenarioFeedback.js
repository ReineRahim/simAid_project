/**
 * Generate feedback for multiple-choice scenario questions.
 * @param {string[]} userAnswers - Array of selected answers (e.g. ["A", "C", "B", "D"])
 * @param {Array} steps - Array of step objects (each has correct_action, feedback_message)
 * @returns {object} feedback summary
 */
export function generateScenarioFeedback(userAnswers, steps) {
  if (!Array.isArray(userAnswers) || !Array.isArray(steps)) {
    throw new Error("Invalid input to generateScenarioFeedback");
  }

  const totalSteps = steps.length;
  let correctCount = 0;

  const detailedFeedback = steps.map((step, index) => {
    const userAnswer = (userAnswers[index] || "").toUpperCase();
    const correctAnswer = (step.correct_action || "").toUpperCase();

    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) correctCount++;

    return {
      step_order: step.step_order,
      question: step.instruction,       
      selected_option: userAnswer || "No answer",
      correct_option: correctAnswer,
      is_correct: isCorrect,
      feedback_message: step.feedback_message || (isCorrect
        ? "✅ Correct!"
        : `❌ The correct answer was "${correctAnswer}".`),
    };
  });

  const score = ((correctCount / totalSteps) * 100).toFixed(0);

  // 🎯 Generate summary message
  let summary;
  if (score == 100) summary = "Perfect score! You mastered this scenario.";
  else if (score >= 75) summary = "Great effort! You got most of them right.";
  else if (score >= 50) summary = "You're getting there — keep practicing!";
  else summary = "You need more review. Try the scenario again.";

  return {
    total_questions: totalSteps,
    correct_answers: correctCount,
    score: Number(score),
    summary,
    steps_feedback: detailedFeedback,
  };
}

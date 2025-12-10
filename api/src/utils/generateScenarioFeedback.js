/**
 * Generate detailed feedback and a summary score for a user's scenario attempt.
 *
 * Compares a user's answers to the correct answers for each step in a scenario,
 * calculates their total score, and returns both a step-by-step feedback breakdown
 * and an overall performance summary.
 *
 * @function generateScenarioFeedback
 * @param {string[]} userAnswers - Array of user-selected answers (e.g. `["A", "C", "B", "D"]`).
 * @param {Array<Object>} steps - Array of scenario step objects.  
 * Each step should contain:
 *   - `correct_action` {string} — The correct answer (e.g., `"A"`)
 *   - `feedback_message` {string} — Custom feedback for this step
 *   - `step_order` {number} — The step’s order in the scenario
 *   - `instruction` {string} — The question or instruction text
 * @returns {object} Feedback summary object containing:
 * - `total_questions` {number} — Total number of questions
 * - `correct_answers` {number} — Number of correct responses
 * - `score` {number} — Score percentage (0–100)
 * - `summary` {string} — Overall performance message
 * - `steps_feedback` {Array<Object>} — Per-step feedback details
 *
 * @throws {Error} If `userAnswers` or `steps` is not an array.
 *
 * @example
 * const userAnswers = ["A", "C", "B"];
 * const steps = [
 *   { step_order: 1, correct_action: "A", feedback_message: "Good job!", instruction: "Pick A" },
 *   { step_order: 2, correct_action: "B", feedback_message: "Try again!", instruction: "Pick B" },
 *   { step_order: 3, correct_action: "B", instruction: "Pick B" }
 * ];
 *
 * const feedback = generateScenarioFeedback(userAnswers, steps);
 * console.log(feedback.score); // 67
 * console.log(feedback.summary); // "You're getting there — keep practicing!"
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
      feedback_message:
        step.feedback_message ||
        (isCorrect
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

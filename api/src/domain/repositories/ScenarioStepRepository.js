import { pool } from "../../config/db.js";
import ScenarioStepEntity from "../entities/ScenarioStepEntity.js";

/**
 * Repository class responsible for managing CRUD operations on the `scenario_steps` table.
 *
 * Each scenario step represents a question or decision point within a scenario.
 * This repository provides methods for retrieving, creating, updating, and deleting steps.
 */
export class ScenarioStepRepository {
  /**
   * Retrieves all scenario steps from the database.
   * Mainly used for administrative or debugging purposes.
   *
   * @async
   * @method findAll
   * @returns {Promise<ScenarioStepEntity[]>} A list of all scenario step entities.
   * @example
   * const steps = await scenarioStepRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT step_id, scenario_id, step_order, question_text,
             option_a, option_b, option_c, option_d,
             correct_action, feedback_message
      FROM scenario_steps
      ORDER BY scenario_id, step_order ASC;
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new ScenarioStepEntity(row));
  }

  /**
   * Retrieves a single scenario step by its unique ID.
   *
   * @async
   * @method findById
   * @param {number} id - The ID of the step to retrieve.
   * @returns {Promise<ScenarioStepEntity|null>} The matching step entity, or null if not found.
   * @example
   * const step = await scenarioStepRepo.findById(15);
   */
  async findById(id) {
    const sql = `
      SELECT step_id, scenario_id, step_order, question_text,
             option_a, option_b, option_c, option_d,
             correct_action, feedback_message
      FROM scenario_steps
      WHERE step_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new ScenarioStepEntity(rows[0]) : null;
  }

  /**
   * Retrieves all steps belonging to a specific scenario, ordered by their step order.
   *
   * @async
   * @method findByScenario
   * @param {number} scenario_id - The ID of the scenario whose steps to fetch.
   * @returns {Promise<ScenarioStepEntity[]>} A list of step entities for the scenario.
   * @example
   * const steps = await scenarioStepRepo.findByScenario(3);
   */
  async findByScenario(scenario_id) {
    const sql = `
      SELECT step_id, scenario_id, step_order, question_text,
             option_a, option_b, option_c, option_d,
             correct_action, feedback_message
      FROM scenario_steps
      WHERE scenario_id = ?
      ORDER BY step_order ASC;
    `;
    const [rows] = await pool.query(sql, [scenario_id]);
    return rows.map(row => new ScenarioStepEntity(row));
  }

  /**
   * Creates a new multiple-choice scenario step.
   *
   * @async
   * @method create
   * @param {object} params - Step creation parameters.
   * @param {number} params.scenario_id - ID of the scenario the step belongs to.
   * @param {number} params.step_order - The sequence order of the step.
   * @param {string} params.question_text - The question text for this step.
   * @param {{A: string, B: string, C: string, D: string}} params.options - Multiple-choice options.
   * @param {string} params.correct_action - The correct answer option ('A', 'B', 'C', or 'D').
   * @param {string} [params.feedback_message] - Optional feedback to display after answering.
   * @returns {Promise<ScenarioStepEntity|null>} The newly created step entity or null if creation failed.
   * @example
   * const newStep = await scenarioStepRepo.create({
   *   scenario_id: 1,
   *   step_order: 2,
   *   question_text: "What should you do first?",
   *   options: { A: "Call for help", B: "Assess the situation", C: "Run", D: "Ignore" },
   *   correct_action: "B",
   *   feedback_message: "Always assess before acting."
   * });
   */
  async create({ scenario_id, step_order, question_text, options, correct_action, feedback_message }) {
    const sql = `
      INSERT INTO scenario_steps (
        scenario_id, step_order, question_text,
        option_a, option_b, option_c, option_d,
        correct_action, feedback_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING step_id, scenario_id, step_order, question_text,
                option_a, option_b, option_c, option_d,
                correct_action, feedback_message;
    `;
    const [rows] = await pool.query(sql, [
      scenario_id,
      step_order,
      question_text,
      options.A,
      options.B,
      options.C,
      options.D,
      correct_action,
      feedback_message
    ]);
    return rows.length ? new ScenarioStepEntity(rows[0]) : null;
  }

  /**
   * Updates an existing scenario step by its ID.
   *
   * @async
   * @method update
   * @param {number} id - The ID of the step to update.
   * @param {object} params - Updated step data.
   * @param {number} params.step_order - Updated step order.
   * @param {string} params.question_text - Updated question text.
   * @param {{A: string, B: string, C: string, D: string}} params.options - Updated options.
   * @param {string} params.correct_action - Updated correct answer ('A', 'B', 'C', or 'D').
   * @param {string} [params.feedback_message] - Updated feedback message.
   * @returns {Promise<ScenarioStepEntity|null>} The updated step entity or null if not found.
   * @example
   * const updated = await scenarioStepRepo.update(4, {
   *   step_order: 2,
   *   question_text: "What should you check next?",
   *   options: { A: "Vitals", B: "Safety", C: "Call supervisor", D: "None" },
   *   correct_action: "A",
   *   feedback_message: "Checking vitals comes next."
   * });
   */
  async update(id, { step_order, question_text, options, correct_action, feedback_message }) {
    const sql = `
      UPDATE scenario_steps
      SET step_order = ?,
          question_text = ?,
          option_a = ?,
          option_b = ?,
          option_c = ?,
          option_d = ?,
          correct_action = ?,
          feedback_message = ?
      WHERE step_id = ?
      RETURNING step_id, scenario_id, step_order, question_text,
                option_a, option_b, option_c, option_d,
                correct_action, feedback_message;
    `;
    const [rows] = await pool.query(sql, [
      step_order,
      question_text,
      options.A,
      options.B,
      options.C,
      options.D,
      correct_action,
      feedback_message,
      id
    ]);
    return rows.length ? new ScenarioStepEntity(rows[0]) : null;
  }

  /**
   * Deletes a scenario step from the database.
   *
   * @async
   * @method delete
   * @param {number} id - The ID of the step to delete.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @example
   * const removed = await scenarioStepRepo.delete(10);
   */
  async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM scenario_steps WHERE step_id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

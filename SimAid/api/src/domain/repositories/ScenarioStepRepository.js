import { pool } from "../../config/db.js";
import ScenarioStepEntity from "../entities/ScenarioStepEntity.js";

export class ScenarioStepRepository {
  // 🧩 Get all steps (used mainly for admin/debug)
  async findAll() {
    const sql = `
      SELECT step_id, scenario_id, step_order, question_text,
             option_a, option_b, option_c, option_d,
             correct_action, feedback_message
      FROM scenario_steps
      ORDER BY scenario_id, step_order ASC;
    `;
    const [ rows ] = await pool.query(sql);
    return rows.map(row => new ScenarioStepEntity(row));
  }

  // 🔍 Get step by ID
  async findById(id) {
    const sql = `
      SELECT step_id, scenario_id, step_order, question_text,
             option_a, option_b, option_c, option_d,
             correct_action, feedback_message
      FROM scenario_steps
      WHERE step_id = ?;
    `;
    const [ rows ] = await pool.query(sql, [id]);
    return rows.length ? new ScenarioStepEntity(rows[0]) : null;
  }

  // 📋 Get all steps for a given scenario (ordered)
  async findByScenario(scenario_id) {
    const sql = `
      SELECT step_id, scenario_id, step_order, question_text,
             option_a, option_b, option_c, option_d,
             correct_action, feedback_message
      FROM scenario_steps
      WHERE scenario_id = ?
      ORDER BY step_order ASC;
    `;
    const [ rows ] = await pool.query(sql, [scenario_id]);
    return rows.map(row => new ScenarioStepEntity(row));
  }

  // 🧱 Create a new MCQ step
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
    const [ rows ] = await pool.query(sql, [
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

  // 🔧 Update an existing step
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
    const [ rows ] = await pool.query(sql, [
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

  // ❌ Delete step
  async delete(id) {
    const [ rowCount ] = await pool.query(
      `DELETE FROM scenario_steps WHERE step_id = ?`,
      [id]
    );
    return rowCount > 0;
  }
}

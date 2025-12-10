import { validationResult } from "express-validator";
import { generateScenarioFeedback } from "../utils/generateScenarioFeedback.js";

export class ScenarioController {
  constructor(scenarioService, scenarioStepService, attemptRepo, badgeRepo, userBadgeRepo, userLevelRepo) {
    this.scenarioService = scenarioService;
    this.scenarioStepService = scenarioStepService;
    this.attemptRepo = attemptRepo;
    this.badgeRepo = badgeRepo;
    this.userBadgeRepo = userBadgeRepo;
    this.userLevelRepo = userLevelRepo; // ✅ added
  }

  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  // ------------------------------------------------------------
  // 📋 List all scenarios
  // ------------------------------------------------------------
  list = async (req, res, next) => {
    try {
      const scenarios = await this.scenarioService.listScenarios();
      res.json(scenarios);
    } catch (e) {
      next(e);
    }
  };

  // ------------------------------------------------------------
  // 📘 Get one scenario (with ordered steps)
  // ------------------------------------------------------------
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const scenario = await this.scenarioService.getScenario(req.params.id);
      if (!scenario)
        return res.status(404).json({ message: "Scenario not found" });

      const steps = await this.scenarioStepService.getStepsByScenario(req.params.id);
      res.json({ ...scenario, steps });
    } catch (e) {
      next(e);
    }
  };

   listByLevel = async (req, res) => {
    const levelId = Number(req.params.levelId);
    if (!levelId) return res.status(400).json({ message: "Invalid level ID" });
    try {
      const scenarios = await this.scenarioService.listByLevel(levelId);
      return res.json(scenarios);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };


  // ------------------------------------------------------------
  // 🛠 Admin: Create a new scenario
  // ------------------------------------------------------------
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const newScenario = await this.scenarioService.createScenario(req.body);
      res.status(201).json(newScenario);
    } catch (e) {
      next(e);
    }
  };

  // ------------------------------------------------------------
  // 🔧 Admin: Update existing scenario
  // ------------------------------------------------------------
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const updatedScenario = await this.scenarioService.updateScenario(req.params.id, req.body);
      if (!updatedScenario)
        return res.status(404).json({ message: "Scenario not found" });
      res.status(200).json(updatedScenario);
    } catch (e) {
      next(e);
    }
  };

  // ------------------------------------------------------------
  // ❌ Admin: Delete scenario
  // ------------------------------------------------------------
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const ok = await this.scenarioService.deleteScenario(req.params.id);
      if (!ok)
        return res.status(404).json({ message: "Scenario not found" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };

  // ------------------------------------------------------------
  // 🧠 User: Submit answers & update progress + badges
  // ------------------------------------------------------------
// ScenarioController.js
submit = async (req, res, next) => {
  try {
    const { userAnswers } = req.body;
    const scenarioId = parseInt(req.params.id, 10);

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: "userAnswers must be an array." });
    }

    const scenario = await this.scenarioService.getScenario(scenarioId);
    if (!scenario) return res.status(404).json({ message: "Scenario not found" });

    const steps = await this.scenarioStepService.getStepsByScenario(scenarioId);
    if (!steps || steps.length === 0) {
      return res.status(404).json({ message: "No steps found for this scenario." });
    }

    const total = steps.length;
    let correctCount = 0;

    steps
      .sort((a, b) => Number(a.step_order) - Number(b.step_order))
      .forEach((step, i) => {
        const picked = (userAnswers[i] || "").toString().toUpperCase();
        const correct = (step.correct_action || "").toString().toUpperCase();
        if (picked && picked === correct) correctCount += 1;
      });

    const score = Math.round((correctCount / total) * 100);
    const allCorrect = correctCount === total;

    const result = {
      score,
      all_correct: allCorrect,
      level_id: scenario.level_id,
      scenario_id: scenarioId,
    };

    const userId = req.user?.id;
    if (userId) {
      await this.attemptRepo.upsertBestScore({
        user_id: userId,
        scenario_id: scenarioId,
        score,
        all_correct: allCorrect,
      });

      const perfectInLevel = await this.attemptRepo.countPerfectByUserInLevel(
        userId,
        scenario.level_id
      );
      const totalInLevel = await this.scenarioService.scenarioRepository.countByLevel(
        scenario.level_id
      );

      const completedThisLevel = totalInLevel > 0 && perfectInLevel === totalInLevel;

      await this.userLevelRepo.upsertProgress({
        user_id: userId,
        level_id: scenario.level_id,
        unlocked: true,
        completed: completedThisLevel,
      });

      if (completedThisLevel) {
        const nextLevelId = scenario.level_id + 1;
        await this.userLevelRepo.upsertProgress({
          user_id: userId,
          level_id: nextLevelId,
          unlocked: true,
          completed: false,
        });

        result.level_progress = {
          level_id: scenario.level_id,
          completed: true,
          next_level_unlocked: nextLevelId,
        };

        const badge = await this.badgeRepo.findByLevel(scenario.level_id);
        if (badge) {
          const existing = await this.userBadgeRepo.findByUserAndBadge(
            userId,
            badge.badge_id
          );
          if (!existing) {
            await this.userBadgeRepo.create({
              user_id: userId,
              badge_id: badge.badge_id,
            });
            result.awarded_badge = {
              badge_id: badge.badge_id,
              name: badge.name,
              description: badge.description,
              icon_url: badge.icon_url,
            };
          }
        }
      } else {
        result.level_progress = {
          level_id: scenario.level_id,
          completed: false,
          perfect_in_level: perfectInLevel,
          total_in_level: totalInLevel,
        };
      }

      // ✅ Include updated scenario with progress
      const updatedScenario = await this.scenarioService.getScenario(scenarioId);
      result.updated_scenario = updatedScenario;
    }

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};


}

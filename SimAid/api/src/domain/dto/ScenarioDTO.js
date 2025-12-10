export default class ScenarioDTO {
    constructor({ scenario_id, level_id, title, description, image_url }) {
        this.scenario_id = scenario_id;
        this.level_id = level_id;
        this.title = title;
        this.description = description;
        this.image_url = image_url;
    }

    static fromEntity(entity) {
        return new ScenarioDTO(entity);
    }
}

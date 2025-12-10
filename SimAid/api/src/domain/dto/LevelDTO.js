export default class LevelDTO {
    constructor({ level_id, title, description, difficulty }) {
        this.level_id = level_id;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty; 
    }

    static fromEntity(entity) {
        return new LevelDTO(entity);
    }
}

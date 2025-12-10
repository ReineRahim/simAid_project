import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLevelUniqueIndex1730000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasIndex = await queryRunner.query(
      `
      SELECT COUNT(1) as count
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'user_levels'
        AND index_name = 'uq_user_levels_user_level';
    `,
    );

    const count = Number(hasIndex?.[0]?.count ?? 0);
    if (count === 0) {
      await queryRunner.query(
        `ALTER TABLE user_levels ADD UNIQUE INDEX uq_user_levels_user_level (user_id, level_id);`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_levels DROP INDEX uq_user_levels_user_level;`,
    );
  }
}

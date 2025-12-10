import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBadgeUniqueIndex1730000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(
      `
      SELECT COUNT(1) as count
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'user_badges'
        AND index_name = 'uq_user_badges_user_badge';
    `,
    );
    const count = Number(rows?.[0]?.count ?? 0);
    if (count === 0) {
      await queryRunner.query(
        `ALTER TABLE user_badges ADD UNIQUE INDEX uq_user_badges_user_badge (user_id, badge_id);`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_badges DROP INDEX uq_user_badges_user_badge;`);
  }
}

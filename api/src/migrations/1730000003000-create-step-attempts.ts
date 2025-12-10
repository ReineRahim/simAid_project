import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStepAttempts1730000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('step_attempts');
    if (hasTable) return;

    await queryRunner.createTable(
      new Table({
        name: 'step_attempts',
        columns: [
          {
            name: 'step_attempt_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'attempt_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'step_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'user_action',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'is_correct',
            type: 'tinyint',
            width: 1,
            default: 0,
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('step_attempts', true);
  }
}

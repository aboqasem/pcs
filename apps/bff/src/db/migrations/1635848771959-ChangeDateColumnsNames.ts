import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDateColumnsNames1635848771959 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('course', 'beginDate', 'beginsAt');
    await queryRunner.renameColumn('course', 'endDate', 'endsAt');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('course', 'beginsAt', 'beginDate');
    await queryRunner.renameColumn('course', 'endsAt', 'endDate');
  }
}

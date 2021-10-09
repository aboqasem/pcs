import { MigrationInterface, QueryRunner } from 'typeorm';

export class CollationCaseInsensitive1632903673994 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE COLLATION case_insensitive (provider = icu, locale = 'und-u-ks-level2', deterministic = false);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP COLLATION case_insensitive;`);
  }
}

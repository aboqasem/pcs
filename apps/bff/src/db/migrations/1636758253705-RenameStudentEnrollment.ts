import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameStudentEnrollment1636758253705 implements MigrationInterface {
  name = 'RenameStudentEnrollment1636758253705';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('student_enrollment', 'enrolled_student');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('enrolled_student', 'student_enrollment');
  }
}

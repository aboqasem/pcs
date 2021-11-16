import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameStudentEnrollmentColumns1637057662311 implements MigrationInterface {
  name = 'RenameStudentEnrollmentCourseIdFk1637057662311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('student_enrollment', 'enrolledInCourseId', 'courseId');

    // rename `enrolled_student_status` to `student_enrollment_status`
    await queryRunner.query(
      `ALTER TYPE "public"."enrolled_student_status" RENAME TO "enrolled_student_status_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."student_enrollment_status" AS ENUM('enrolled', 'barred', 'dropped')`,
    );
    await queryRunner.query(`ALTER TABLE "student_enrollment" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ALTER COLUMN "status" TYPE "public"."student_enrollment_status" USING "status"::"text"::"public"."student_enrollment_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ALTER COLUMN "status" SET DEFAULT 'enrolled'`,
    );
    await queryRunner.query(`DROP TYPE "public"."enrolled_student_status_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('student_enrollment', 'courseId', 'enrolledInCourseId');

    // rename `student_enrollment_status` to `enrolled_student_status`
    await queryRunner.query(
      `CREATE TYPE "public"."enrolled_student_status_old" AS ENUM('enrolled', 'barred', 'dropped')`,
    );
    await queryRunner.query(`ALTER TABLE "student_enrollment" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ALTER COLUMN "status" TYPE "public"."enrolled_student_status_old" USING "status"::"text"::"public"."enrolled_student_status_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_enrollment" ALTER COLUMN "status" SET DEFAULT 'enrolled'`,
    );
    await queryRunner.query(`DROP TYPE "public"."student_enrollment_status"`);
    await queryRunner.query(
      `ALTER TYPE "public"."enrolled_student_status_old" RENAME TO "enrolled_student_status"`,
    );
  }
}

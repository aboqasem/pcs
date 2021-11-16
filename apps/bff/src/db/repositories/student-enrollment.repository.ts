import { StudentEnrollmentEntity } from 'src/db/entities/student-enrollment.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(StudentEnrollmentEntity)
export class StudentEnrollmentsRepository extends Repository<StudentEnrollmentEntity> {}

import { EnrolledStudentEntity } from 'src/db/entities/enrolled-student.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(EnrolledStudentEntity)
export class EnrolledStudentsRepository extends Repository<EnrolledStudentEntity> {}

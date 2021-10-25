import { CourseEntity } from 'src/db/entities/course.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(CourseEntity)
export class CoursesRepository extends Repository<CourseEntity> {}

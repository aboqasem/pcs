import {
  CourseDto,
  Material,
  MaterialStatus,
  MaterialType,
  UserDto,
} from '@pcs/shared-data-access';
import { CourseEntity } from 'src/db/entities/course.entity';
import { QuestionEntity } from 'src/db/entities/question.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { numericTransformer } from 'src/db/transformers/numeric.transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('material')
export class MaterialEntity extends Material {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  title!: string;

  @Column('text', { nullable: true })
  description?: string | null;

  @Column('enum', {
    enum: MaterialType,
    enumName: 'material_type',
  })
  type!: MaterialType;

  @Column('timestamptz')
  beginsAt!: Date;

  @Column('timestamptz', { nullable: true })
  endsAt?: Date | null;

  @Column('enum', {
    enum: MaterialStatus,
    enumName: 'material_status',
    default: MaterialStatus.Draft,
  })
  status = MaterialStatus.Draft;

  @Column('numeric', {
    precision: 6,
    scale: 2,
    transformer: numericTransformer,
  })
  totalMark!: number;

  @Column('smallint', { nullable: true })
  totalDuration?: number | null;

  /* JOINED RELATIONS */

  @Column('uuid')
  createdForCourseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.materials)
  @JoinColumn({ name: 'createdForCourseId', referencedColumnName: 'id' })
  createdForCourse?: CourseDto;

  @Column('integer')
  creatorInstructorId!: number;

  @ManyToOne(() => UserEntity, (user) => user.instructorCreatedMaterials)
  @JoinColumn({ name: 'creatorInstructorId', referencedColumnName: 'id' })
  creatorInstructor?: UserDto;

  /* OTHER RELATIONS */

  @OneToMany(() => QuestionEntity, (question) => question.material, { nullable: true })
  questions?: QuestionEntity[] | null;
}

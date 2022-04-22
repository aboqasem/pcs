import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { MaterialsModule } from 'src/modules/materials/materials.module';
import { QuestionsModule } from 'src/modules/questions/questions.module';
import { StudentEnrollmentsModule } from 'src/modules/student-enrollments/student-enrollments';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoursesRepository]),
    forwardRef(() => MaterialsModule),
    forwardRef(() => QuestionsModule),
    forwardRef(() => StudentEnrollmentsModule),
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [TypeOrmModule, CoursesService],
})
export class CoursesModule {}

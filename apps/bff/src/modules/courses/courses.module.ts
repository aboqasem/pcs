import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoursesRepository])],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [TypeOrmModule],
})
export class CoursesModule {}

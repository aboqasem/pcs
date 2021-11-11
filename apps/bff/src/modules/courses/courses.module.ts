import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoursesRepository, MaterialsRepository])],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [TypeOrmModule],
})
export class CoursesModule {}

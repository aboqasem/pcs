import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesRepository } from 'src/db/repositories/course.repository';
import { MaterialsModule } from 'src/modules/materials/materials.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [TypeOrmModule.forFeature([CoursesRepository]), forwardRef(() => MaterialsModule)],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [TypeOrmModule, CoursesService],
})
export class CoursesModule {}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { CoursesModule } from 'src/modules/courses/courses.module';
import { MaterialsService } from './materials.service';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialsRepository]), forwardRef(() => CoursesModule)],
  providers: [MaterialsService],
  exports: [TypeOrmModule, MaterialsService],
})
export class MaterialsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsRepository } from 'src/db/repositories/material.repository';
import { MaterialsService } from './materials.service';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialsRepository])],
  providers: [MaterialsService],
  exports: [TypeOrmModule, MaterialsService],
})
export class MaterialsModule {}

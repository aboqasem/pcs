import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsModule } from 'src/modules/materials/materials.module';
import { QuestionsService } from './questions.service';

@Module({
  imports: [TypeOrmModule.forFeature([]), forwardRef(() => MaterialsModule)],
  providers: [QuestionsService],
  exports: [TypeOrmModule, QuestionsService],
})
export class QuestionsModule {}

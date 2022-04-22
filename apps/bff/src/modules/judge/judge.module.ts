import { JudgeController } from './judge.controller';
import { JudgeService } from './judge.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [JudgeController],
  providers: [JudgeService],
})
export class JudgeModule {}

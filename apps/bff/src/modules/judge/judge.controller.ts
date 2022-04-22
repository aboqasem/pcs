import { Body, Controller, Get, Post, Sse } from '@nestjs/common';
import {
  JudgeRegisterSubmissionBody,
  TJudgeGetResultData,
  TJudgeGetRuntimesData,
  TJudgeRegisterSubmissionData,
} from '@pcs/shared-data-access';
import { from, Observable } from 'rxjs';
import { SubmissionId } from 'src/modules/judge/decorators/submission-id-param.decorator';
import { JudgeService } from 'src/modules/judge/judge.service';

@Controller('judge')
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  @Get('runtimes')
  async runtimes(): Promise<TJudgeGetRuntimesData> {
    return this.judgeService.runtimes();
  }

  @Post('register')
  register(@Body() submission: JudgeRegisterSubmissionBody): TJudgeRegisterSubmissionData {
    const id = this.judgeService.register(submission);

    return { submissionId: id };
  }

  @Sse('/result/:submissionId')
  result(@SubmissionId() id: string): Observable<TJudgeGetResultData> {
    return from(this.judgeService.result(id));
  }
}

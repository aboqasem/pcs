import { JudgeSubmission } from './judge.classes';
import { supportedRuntimes } from './judge.data';

export type TJudgeGetRuntimesData = typeof supportedRuntimes[number][];

export type TJudgeGetResultData = ({
  output?: string;
  error?: string;
  result?: boolean;
} | null)[];

export class JudgeRegisterSubmissionBody extends JudgeSubmission {}
export type TJudgeRegisterSubmissionData = { submissionId: string };

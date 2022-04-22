import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import {
  JudgeSubmission,
  runtimesPistonAliases,
  supportedRuntimes,
  TJudgeGetResultData,
  TJudgeGetRuntimesData,
} from '@pcs/shared-data-access';
import LZString from 'lz-string';
import { NodePistonClient as PistonClient } from 'piston-api-client';
import { config } from 'src/config/config';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const day = 1000 * 60 * 60 * 24;

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  private pistonClient: PistonClient = new PistonClient({ server: config.PISTON_SERVER });

  private cache: Map<
    string,
    { timeRegistered: Date; submission: JudgeSubmission; result?: TJudgeGetResultData }
  > = new Map();

  async runtimes(): Promise<TJudgeGetRuntimesData> {
    return this.pistonClient.runtimes().then((pistonRuntimes) => {
      if (!pistonRuntimes.success) {
        return [];
      }

      return supportedRuntimes.filter((runtime) =>
        pistonRuntimes.data.some((pistonRuntime) => {
          return (
            pistonRuntime.language === runtimesPistonAliases[runtime] ||
            pistonRuntime.aliases.includes(runtimesPistonAliases[runtime])
          );
        }),
      );
    });
  }

  register(submission: JudgeSubmission): string {
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(submission));

    if (!this.cache.has(compressed)) {
      this.cache.set(compressed, { timeRegistered: new Date(), submission });
    }

    return compressed;
  }

  async *result(id: string): AsyncGenerator<TJudgeGetResultData> {
    const cached = this.cache.get(id);

    if (!cached) {
      throw new NotFoundException('Data not found');
    }

    if (cached.result) {
      return yield cached.result;
    }

    const {
      submission: { runtime, codeSnippet, testCases },
    } = cached;

    const { length } = testCases;

    const judgeResults: TJudgeGetResultData = new Array(length).fill(null);

    for (let i = 0; i < length; ++i) {
      const testCase = testCases[i]!;

      const result = await this.pistonClient.execute({
        language: runtimesPistonAliases[runtime],
        version: '*',
        args: testCase.args,
        files: [
          {
            content: codeSnippet,
          },
        ],
        stdin: testCase.input,
      });

      if (!result.success) {
        this.logger.debug(result.error);
        judgeResults[i] = {
          error:
            result.error instanceof Error
              ? result.error.message
              : 'An error occurred while executing the test case',
        };

        return;
      }

      const { run, compile } = result.data;

      if (compile?.stderr) {
        for (; i < length; ++i) {
          judgeResults[i] = {
            error: compile.stderr,
          };
        }
      } else if (run?.stderr) {
        judgeResults[i] = {
          error: run.stderr,
        };
      } else {
        judgeResults[i] = {
          output: run.stdout,
          result: run.stdout.replace(/\r?\n$/, '') === testCase.output.replace(/\r?\n$/, ''),
        };
      }

      yield judgeResults;

      if (!config.PISTON_SERVER?.includes('localhost') && i < length - 1) {
        await sleep(200);
      }
    }

    cached.result = judgeResults;
  }

  @Interval(day)
  private _clearCache(): void {
    const now = new Date();

    this.cache.forEach((cached, id) => {
      if (now.getTime() - cached.timeRegistered.getTime() > day) {
        this.logger.debug(`Clearing data with id "${id}" from cache`);
        this.cache.delete(id);
      }
    });
  }
}

import { BffPath } from '@/lib/constants/shared.constants';
import { useSseQuery, UseSseQueryOptions } from '@/lib/hooks/use-sse-query';
import {
  HttpError,
  JudgeRegisterSubmissionBody,
  TJudgeGetResultData,
  TJudgeGetRuntimesData,
  TJudgeRegisterSubmissionData,
} from '@pcs/shared-data-access';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';
import { bffAxios } from '../axios.config';

export const judgeQueryKeys = {
  all: ['judge'] as const,
  getRuntimes: () => [...judgeQueryKeys.all, 'get', 'runtimes'] as const,
  getResult: (submissionId?: string) =>
    [...judgeQueryKeys.all, 'get', 'result', submissionId] as const,
};

export type TGetJudgeRuntimesQueryKey = ReturnType<typeof judgeQueryKeys.getRuntimes>;

export type TGetCourseQueryKey = ReturnType<typeof judgeQueryKeys.getResult>;

export class JudgeService {
  static getRuntimes = async (cookie?: string): Promise<TJudgeGetRuntimesData> => {
    const options = cookie ? { headers: { cookie } } : {};

    return bffAxios.get(BffPath.JudgeRuntimes, options).then(({ data }) => data);
  };

  static registerSubmission = async (
    body: JudgeRegisterSubmissionBody,
  ): Promise<TJudgeRegisterSubmissionData> => {
    return bffAxios
      .post<TJudgeRegisterSubmissionData>(BffPath.JudgeRegister, body)
      .then(({ data }) => data);
  };
}

export function useJudgeRuntimesQuery<TData = TJudgeGetRuntimesData>(
  options?: UseQueryOptions<TJudgeGetRuntimesData, Error, TData, TGetJudgeRuntimesQueryKey>,
) {
  return useQuery(judgeQueryKeys.getRuntimes(), () => JudgeService.getRuntimes(), {
    onSettled: async (_, error) => {
      if (error) {
        return toast.error(error.message, { id: 'judgeError' });
      }
    },
    ...options,
  });
}

export function useJudgeResultSseQuery(
  submissionId: string | undefined,
  options?: UseSseQueryOptions<
    TJudgeGetResultData,
    HttpError,
    TJudgeGetResultData,
    TJudgeGetResultData
  >,
) {
  return useSseQuery<TJudgeGetResultData, string, HttpError>(
    judgeQueryKeys.getResult(submissionId),
    BffPath.JudgeResult.replace('[submissionId]', submissionId ?? ''),
    {
      ...options,
      enabled: !!submissionId,
    },
  );
}

export function useJudgeSubmitMutation(
  options?: UseMutationOptions<
    TJudgeRegisterSubmissionData,
    HttpError,
    JudgeRegisterSubmissionBody
  >,
) {
  return useMutation(JudgeService.registerSubmission, options);
}

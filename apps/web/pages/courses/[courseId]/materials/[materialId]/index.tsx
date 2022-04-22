import { Dropdown, IDropdownItem } from '@/components/Dropdown';
import { CreateQuestionForm } from '@/components/forms/CreateQuestionForm';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Link } from '@/components/Link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import {
  useAnnounceCourseMaterialMutation,
  useCourseMaterialQuery,
  useCourseMaterialQuestionsQuery,
} from '@/lib/api/services/courses.service';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { courseNavigationItems } from '@/lib/constants/courses.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { TPropsWithDehydratedState } from '@/lib/types';
import { classNames } from '@/lib/utils/style.utils';
import { capitalize, MaterialStatus, QuestionType, UserRole } from '@pcs/shared-data-access';
import LZString from 'lz-string';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HiChevronLeft, HiOutlineQuestionMarkCircle, HiQuestionMarkCircle } from 'react-icons/hi';
import ReactMarkdown from 'react-markdown';
import { dehydrate } from 'react-query';

export default function Material() {
  const { push, replace } = useRouter();

  const { courseId, materialId, qNo } =
    useQueryParams<{ courseId: string; materialId: string; qNo?: string }>();
  const selectedQNo = +(qNo || NaN);

  const [questionFormState, setQuestionFormState] = useState({
    type: QuestionType.ShortAnswer as QuestionType,
    isShown: false,
  });

  const { data: profile } = useProfileQuery<UserRole.Instructor>();

  const courseHref = useMemo(
    () => ({ pathname: PagePath.Course, query: { courseId } }),
    [courseId],
  );

  const materialQuery = useCourseMaterialQuery(courseId, materialId, {
    onError: () => push(courseHref),
  });
  const { data: material } = materialQuery;

  const announceMaterialMutation = useAnnounceCourseMaterialMutation();

  const questionsQuery = useCourseMaterialQuestionsQuery(courseId, materialId, {
    enabled: !!material,
  });
  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);
  const areQuestionsLoading = questionsQuery.isIdle || questionsQuery.isLoading;

  const selectedQuestion = useMemo(() => questions[selectedQNo - 1], [questions, selectedQNo]);
  const isQNotFound = !isNaN(selectedQNo) && !selectedQuestion;

  const materialHref = useMemo(() => ({ query: { courseId, materialId } }), [courseId, materialId]);

  const questionsHrefs = useMemo(
    () =>
      questions.map((_, idx) => ({
        query: {
          courseId,
          materialId,
          qNo: idx + 1,
        },
      })),
    [courseId, materialId, questions],
  );

  const { current: dropdownItems } = useRef<IDropdownItem[]>(
    Object.values(QuestionType).map((type) => ({
      label: `${capitalize(type.replace(/_/g, ' '))} question`,
      onClick:
        type === QuestionType.Coding
          ? () => setQuestionFormState({ type, isShown: true })
          : undefined,
    })),
  );

  const closeCreateQuestionForm = useCallback(
    () => setQuestionFormState((prev) => ({ ...prev, isShown: false })),
    [],
  );

  useEffect(() => {
    if (!qNo && questionsHrefs.length) {
      replace(questionsHrefs[0]!, undefined, { shallow: true });
    }
  }, [replace, qNo, questionsHrefs]);

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {material?.title ?? 'Material'}
          {selectedQuestion ? ` - Q${qNo}` : ''}
        </title>
      </Head>

      <SidebarLayout navigationItems={courseNavigationItems[profile.role]} narrow>
        <div className="relative flex h-full overflow-hidden bg-white">
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {material && questions.length ? (
              <div className="relative z-0 flex flex-1 overflow-hidden">
                {selectedQuestion || isQNotFound ? (
                  <div className="relative z-0 flex-1 overflow-y-auto focus:outline-none md:order-last">
                    {/* Breadcrumb */}
                    <nav
                      className="flex items-start px-4 py-3 space-x-4 sm:px-6 md:px-8 md:hidden"
                      aria-label="Breadcrumb"
                    >
                      <Link
                        href={courseHref}
                        shallow
                        className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                      >
                        <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                        <span>Course</span>
                      </Link>

                      <Link
                        href={materialHref}
                        shallow
                        className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                      >
                        <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                        <span>Questions</span>
                      </Link>
                    </nav>

                    {selectedQuestion ? (
                      <article>
                        <div className="max-w-2xl px-4 pt-6 pb-5 mx-auto space-y-6 sm:px-6 md:px-8 xl:pt-4">
                          <div>
                            <p className="block mb-2 text-sm font-medium text-gray-900">
                              Description
                            </p>

                            <article className="block w-full px-4 py-3 text-sm prose rounded-md prose-neutral bg-gray-50 max-w-none">
                              <ReactMarkdown>{selectedQuestion.description}</ReactMarkdown>
                            </article>
                          </div>

                          {selectedQuestion.type === QuestionType.Coding && (
                            <>
                              <div>
                                <p className="block mb-2 text-sm font-medium text-gray-900">
                                  Code Snippet
                                </p>

                                <article className="block w-full text-sm prose rounded-md prose-neutral max-w-none">
                                  <ReactMarkdown>{`\`\`\`\n${selectedQuestion.codeSnippet}\n\`\`\``}</ReactMarkdown>
                                </article>
                              </div>

                              <div>
                                <p className="block mb-2 text-sm font-medium text-gray-900">
                                  Runtime
                                </p>
                                <p className="block px-4 py-3 text-sm whitespace-pre-wrap rounded-md bg-gray-50">
                                  {selectedQuestion.runtime}
                                </p>
                              </div>

                              <div>
                                <p className="block text-sm font-medium text-gray-900">
                                  Test Cases
                                </p>

                                <div className="mt-2">
                                  <div className="flex flex-col space-y-2">
                                    {selectedQuestion.testCases.map((testCase, index) => (
                                      <div key={index} className="flex-1">
                                        <div className="flex px-4 py-3 rounded-md bg-gray-50">
                                          <div className="grid flex-1 grid-flow-col gap-2">
                                            <div className="overflow-x-auto">
                                              <div className="text-sm font-medium leading-relaxed text-gray-900">
                                                Input
                                              </div>
                                              <div className="mt-1"></div>
                                              <p className="overflow-x-auto font-mono text-sm leading-none whitespace-pre-wrap">
                                                {testCase.input}
                                              </p>
                                            </div>

                                            <div className="overflow-x-auto">
                                              <div className="text-sm font-medium leading-relaxed text-gray-900">
                                                Expected
                                              </div>
                                              <div className="mt-1"></div>
                                              <p className="overflow-x-auto font-mono text-sm leading-none whitespace-pre-wrap">
                                                {testCase.output}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end flex-shrink-0 pt-6">
                                <button
                                  type="button"
                                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                  onClick={() => {
                                    window.open(
                                      PagePath.AttemptQuestion.replace(
                                        '[compressedData]',
                                        LZString.compressToEncodedURIComponent(
                                          JSON.stringify(selectedQuestion),
                                        ),
                                      ),
                                    );
                                  }}
                                >
                                  Test attempt
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </article>
                    ) : (
                      <div className="relative flex flex-col items-center justify-center w-full p-12">
                        <div className="text-center">
                          <HiOutlineQuestionMarkCircle
                            className="w-12 h-12 mx-auto text-gray-400"
                            aria-hidden="true"
                          />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Question not found
                          </h3>
                          <p className="hidden mt-1 text-sm text-gray-500 md:block">
                            Please select a question.
                          </p>

                          <div className="mt-4 md:hidden">
                            <Link
                              href={materialHref}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Select Question
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex-col items-center justify-center hidden w-full p-12 m-10 border-2 border-gray-400 border-dashed rounded-lg md:flex">
                    <HiQuestionMarkCircle
                      className="w-12 h-12 mx-auto text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="block mt-2 text-sm font-medium text-gray-900">
                      Select a question
                    </span>
                  </div>
                )}

                <aside
                  className={classNames(
                    'w-full shrink-0 border-r border-gray-200 md:order-first md:flex md:flex-col md:w-72',
                    (selectedQuestion || isQNotFound) && 'hidden',
                  )}
                >
                  <nav
                    className="flex items-start px-4 py-3 space-x-4 sm:px-6"
                    aria-label="Breadcrumb"
                  >
                    <Link
                      href={courseHref}
                      shallow
                      className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                    >
                      <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                      <span>Course</span>
                    </Link>
                  </nav>

                  <div className="px-6 pt-2 pb-4">
                    <h2 className="text-lg font-medium text-gray-900">{material.title}</h2>

                    <div className="flex flex-row justify-end">
                      {material.status === MaterialStatus.Draft && (
                        <div className="flex justify-end mt-6 sm:mt-1">
                          <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 mr-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mr-0"
                            onClick={() => {
                              announceMaterialMutation.mutate({ courseId, materialId });
                            }}
                          >
                            Announce
                          </button>
                        </div>
                      )}

                      {material.status === MaterialStatus.Draft && (
                        <div className="flex justify-end mt-6 sm:mt-1">
                          <Dropdown title="Add" items={dropdownItems} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Questions list */}
                  <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Users">
                    {!!questions.length && (
                      <div className="relative">
                        <ul role="list" className="relative z-0 divide-y divide-gray-200">
                          {questions.map((q, i) => {
                            const isCurrent = q === selectedQuestion;
                            const qNo = i + 1;

                            return (
                              <li key={q.id}>
                                <div
                                  className={classNames(
                                    'relative flex items-center px-6 py-5 space-x-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500',
                                    isCurrent ? 'bg-gray-100' : 'hover:bg-gray-50',
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={questionsHrefs[i]!}
                                      shallow
                                      className="focus:outline-none"
                                    >
                                      {/* Extend touch target to entire panel */}
                                      <span className="absolute inset-0" aria-hidden="true" />
                                      <p className="text-sm font-bold text-gray-900">Q{qNo}</p>
                                      <p className="text-sm text-gray-500 truncate">
                                        {capitalize(q.type)} question
                                      </p>
                                    </Link>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </nav>
                </aside>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                {areQuestionsLoading ? (
                  <LoadingSpinner className="w-16 h-16" />
                ) : (
                  <>
                    <HiQuestionMarkCircle
                      className="w-12 h-12 mx-auto text-gray-400"
                      aria-hidden="true"
                    />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No questions</h3>
                    <p className="mt-1 text-sm text-gray-500">Start by creating a question.</p>

                    <div className="mt-6">
                      <Dropdown title="Add" items={dropdownItems} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>

      <CreateQuestionForm {...questionFormState} close={closeCreateQuestionForm} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TPropsWithDehydratedState> = async (ctx) => {
  const queryClient = new DefaultQueryClient();

  const { redirect } = await redirectIf(
    [
      { destination: PagePath.SignIn, predicate: redirectionPredicates.isNotAuthenticated },
      {
        destination: PagePath.Dashboard,
        predicate: redirectionPredicates.isNotInRoles([UserRole.Instructor]),
      },
    ],
    ctx,
    queryClient,
  );

  if (redirect) {
    return { redirect };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

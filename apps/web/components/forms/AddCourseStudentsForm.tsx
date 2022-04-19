import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  coursesQueryKeys,
  useAddCourseStudentMutation,
  useCoursePeopleQuery,
} from '@/lib/api/services/courses.service';
import { useUsersQuery } from '@/lib/api/services/users.service';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { classNames } from '@/lib/utils/style.utils';
import { Dialog, Transition } from '@headlessui/react';
import { UserDto, UserRole } from '@pcs/shared-data-access';
import { Fragment, memo, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import toast from 'react-hot-toast';
import { HiCheck, HiPlusSm, HiSearch, HiX } from 'react-icons/hi';
import { useQueryClient } from 'react-query';

export interface IAddCourseStudentFormProps {
  isShown: boolean;
  close: () => void;
}

enum StudentState {
  None,
  Out,
  Adding,
  Added,
}
type State = { id: UserDto['id']; state: StudentState }[];

export const AddCourseStudentForm = memo(function AddCourseStudentsForm({
  isShown,
  close,
}: IAddCourseStudentFormProps) {
  const queryClient = useQueryClient();
  const { courseId } = useQueryParams<{ courseId: string }>();

  const [search, setSearch] = useState('');

  const studentsQuery = useUsersQuery({
    onError: (error) => {
      toast.error(error.message, { id: 'getStudentsError' });
      close();
    },
  });
  const students = useMemo(() => studentsQuery.data, [studentsQuery.data]);

  const peopleQuery = useCoursePeopleQuery(courseId, {
    onError: () => close(),
  });
  const enrolledStudents = useMemo(
    () => peopleQuery.data?.filter((u) => u.role === UserRole.Student),
    [peopleQuery.data],
  );

  const [studentsStates, dispatch] = useReducer<
    | (<T extends StudentState>(state: State, action: { payload: UserDto['id']; type: T }) => State)
    | (<T extends 'update'>(state: State, action: { payload: State; type: T }) => State)
  >(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: State, action: any) => {
      if (action.type === 'update') {
        return action.payload;
      }

      return state.map((s) => (s.id === action.payload ? { ...s, state: action.type } : s));
    },
    [],
  );

  useEffect(() => {
    if (students) {
      dispatch({
        type: 'update',
        payload: students?.map((s) => ({
          id: s.id,
          state: enrolledStudents?.some((u) => u.id === s.id)
            ? StudentState.Added
            : StudentState.Out,
        })),
      });
    }
  }, [enrolledStudents, students]);

  const addCourseStudentMutation = useAddCourseStudentMutation({
    onMutate: ({ body: { studentId } }) => {
      dispatch({ payload: studentId, type: StudentState.Adding });
    },
    onError: (error, { body: { studentId } }) => {
      dispatch({ payload: studentId, type: StudentState.Out });
      toast.error(error.message, { id: 'addCourseStudentError' });
      close();
    },
    onSuccess: (_, { body: { studentId } }) => {
      dispatch({ payload: studentId, type: StudentState.Added });
      queryClient.invalidateQueries(coursesQueryKeys.getCoursePeople(courseId));
      toast.success(
        `${students!.find(({ id }) => id === studentId)!.fullName} has been added to the course!`,
        {
          duration: 5000,
        },
      );
    },
  });

  const onDone = useCallback(() => {
    close();
  }, [close]);

  return (
    <Transition.Root show={isShown} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={close}>
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block w-full px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:p-6">
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={close}
                >
                  <span className="sr-only">Close</span>
                  <HiX className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex">
                <div className="flex-1 mt-3 space-y-4 overflow-hidden sm:space-y-6 sm:mt-0 sm:mx-4 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-center text-gray-900"
                  >
                    Add students
                  </Dialog.Title>

                  <div className="flex flex-col h-[60vh] border rounded">
                    {students?.length && (
                      <div className="px-6 pt-4 pb-4 border-b">
                        <p className="mt-1 text-sm text-gray-600">
                          Search directory of {students.length} students
                        </p>

                        <div className="flex mt-6 space-x-4">
                          <div className="flex-1 min-w-0">
                            <label htmlFor="search" className="sr-only">
                              Search
                            </label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <HiSearch className="w-5 h-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                id="search"
                                name="search"
                                type="search"
                                className="block w-full pl-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search"
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Students list */}
                    <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Students">
                      {students ? (
                        <ul role="list" className="relative z-0 divide-y divide-gray-200">
                          {students.map((student, i) => {
                            if (
                              !`${student.email} ${student.fullName}`
                                .toLowerCase()
                                .includes(search.toLowerCase().trim())
                            ) {
                              return null;
                            }

                            const { state } = studentsStates[i] ?? { state: StudentState.None };

                            return (
                              <li key={student.id}>
                                <div className="relative flex items-center px-6 py-5 space-x-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {student.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                      {student.email}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      addCourseStudentMutation.mutate({
                                        body: {
                                          studentId: student.id,
                                        },
                                        courseId,
                                      });
                                    }}
                                    className={classNames(
                                      'inline-flex items-center p-1 bg-blue-600 text-white border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ',
                                      state === StudentState.Adding && 'opacity-50',
                                      state === StudentState.Added &&
                                        'pointer-events-none !bg-emerald-600',
                                    )}
                                    disabled={[StudentState.Added, StudentState.Adding].includes(
                                      state,
                                    )}
                                  >
                                    {(state === undefined || state === StudentState.Adding) && (
                                      <LoadingSpinner className="w-5 h-5 !text-white" />
                                    )}

                                    {state === StudentState.Out && (
                                      <>
                                        <span className="sr-only">
                                          Add {student.fullName} to course
                                        </span>
                                        <HiPlusSm className="w-5 h-5" aria-hidden="true" />
                                      </>
                                    )}

                                    {state === StudentState.Added && (
                                      <HiCheck className="w-5 h-5" aria-hidden="true" />
                                    )}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-5 space-x-3 text-center">
                          <LoadingSpinner className="w-10 h-10" />
                        </div>
                      )}
                    </nav>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onDone}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Done
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
});

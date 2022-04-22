export enum PagePath {
  Landing = '/',

  SignIn = '/auth/sign-in',
  RetrievePassword = '/auth/retrieve-password',

  Dashboard = '/dashboard',

  Users = '/users',

  Courses = '/courses',

  Course = '/courses/[courseId]',
  CourseMaterial = '/courses/[courseId]/materials/[materialId]',

  CourseMaterialQuestions = '/courses/[courseId]/materials/[materialId]/questions',

  CoursePeople = '/courses/[courseId]/people',
  CourseGrades = '/courses/[courseId]/grades',
  CourseAbout = '/courses/[courseId]/about',

  AttemptQuestion = '/attempt/q/[compressedData]',
  AttemptMaterial = '/attempt/[courseId]/[materialId]',
}

export enum BffPath {
  Users = 'users',
  Profile = 'users/profile',

  Courses = 'courses',

  Course = 'courses/[courseId]',

  CourseMaterials = 'courses/[courseId]/materials',
  CourseMaterial = 'courses/[courseId]/materials/[materialId]',

  AnnounceCourseMaterial = 'courses/[courseId]/materials/[materialId]/announce',

  CourseMaterialQuestions = 'courses/[courseId]/materials/[materialId]/questions',

  CoursePeople = 'courses/[courseId]/people',

  CourseStudents = 'courses/[courseId]/students',

  JudgeRuntimes = 'judge/runtimes',
  JudgeRegister = 'judge/register',
  JudgeResult = 'judge/result/[submissionId]',

  SignIn = 'auth/sign-in',
  SignOut = 'auth/sign-out',
  RetrievePassword = 'auth/retrieve-password',
}

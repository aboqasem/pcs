export enum PagePath {
  Landing = '/',

  SignIn = '/auth/sign-in',
  RetrievePassword = '/auth/retrieve-password',

  Dashboard = '/dashboard',

  Users = '/users',

  Courses = '/courses',
  Course = '/courses/[courseId]',
}

export enum BffPath {
  Users = 'users',
  Profile = 'users/profile',

  Courses = 'courses',

  SignIn = 'auth/sign-in',
  SignOut = 'auth/sign-out',
  RetrievePassword = 'auth/retrieve-password',
}

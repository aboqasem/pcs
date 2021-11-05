import { INavigationItem, ITab } from '@/components';
import { PagePath } from './shared.constants';
import { UserRole } from '@pcs/shared-data-access';
import { globalNavigationItems } from './global.constants';

export const courseNavigationItems: { [UserRole.Instructor]: INavigationItem[] } = {
  [UserRole.Instructor]: globalNavigationItems[UserRole.Instructor],
};

export const courseTabs: { [UserRole.Instructor]: ITab[] } = {
  [UserRole.Instructor]: [
    { name: 'Feed', pathname: PagePath.Course },
    { name: 'People', pathname: PagePath.CoursePeople },
    { name: 'Grades', pathname: PagePath.CourseGrades },
    { name: 'About', pathname: PagePath.CourseAbout },
  ],
};

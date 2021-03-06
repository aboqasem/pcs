import { INavigationItem } from '@/components/layouts/SidebarLayout';
import { ITab } from '@/components/layouts/TabsLayout';
import { UserRole } from '@pcs/shared-data-access';
import { globalNavigationItems } from './global.constants';
import { PagePath } from './shared.constants';

export const courseNavigationItems: {
  [UserRole.Instructor]: INavigationItem[];
  [UserRole.Student]: INavigationItem[];
} = {
  [UserRole.Instructor]: globalNavigationItems[UserRole.Instructor],
  [UserRole.Student]: globalNavigationItems[UserRole.Student],
};

export const courseTabs: { [UserRole.Instructor]: ITab[]; [UserRole.Student]: ITab[] } = {
  [UserRole.Instructor]: [
    { name: 'Content', pathname: PagePath.Course },
    { name: 'People', pathname: PagePath.CoursePeople },
    { name: 'Grades', pathname: PagePath.CourseGrades },
    { name: 'About', pathname: PagePath.CourseAbout },
  ],
  [UserRole.Student]: [
    { name: 'Content', pathname: PagePath.Course },
    { name: 'People', pathname: PagePath.CoursePeople },
    { name: 'Grades', pathname: PagePath.CourseGrades },
    { name: 'About', pathname: PagePath.CourseAbout },
  ],
};

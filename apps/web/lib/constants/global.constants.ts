import { INavigationItem } from '@/components/layouts/SidebarLayout';
import { UserRole } from '@pcs/shared-data-access';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiHome, HiUsers } from 'react-icons/hi';
import { PagePath } from './shared.constants';

export const globalNavigationItems: { [K in UserRole]: INavigationItem[] } = {
  [UserRole.Admin]: [
    {
      name: 'Dashboard',
      pathname: PagePath.Dashboard,
      icon: HiHome,
    },
    {
      name: 'Users',
      pathname: PagePath.Users,
      icon: HiUsers,
    },
  ],
  [UserRole.Instructor]: [
    {
      name: 'Dashboard',
      pathname: PagePath.Dashboard,
      icon: HiHome,
    },
    {
      name: 'Courses',
      pathname: PagePath.Courses,
      icon: FaChalkboardTeacher,
    },
  ],
  [UserRole.Student]: [
    {
      name: 'Dashboard',
      pathname: PagePath.Dashboard,
      icon: HiHome,
    },
    {
      name: 'Courses',
      pathname: PagePath.Courses,
      icon: FaChalkboardTeacher,
    },
  ],
};

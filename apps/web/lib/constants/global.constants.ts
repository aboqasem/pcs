import { INavigationItem } from '@/components';
import { PagePath } from '@/lib/constants';
import { UserRole } from '@pcs/shared-data-access';
import { HiHome, HiUsers } from 'react-icons/hi';

export const globalNavigationItems: { [K in UserRole]: INavigationItem[] } = {
  [UserRole.Admin]: [
    {
      name: 'Dashboard',
      href: PagePath.Dashboard,
      icon: HiHome,
    },
    {
      name: 'Users',
      href: PagePath.Users,
      icon: HiUsers,
    },
  ],
  [UserRole.Instructor]: [
    {
      name: 'Dashboard',
      href: PagePath.Dashboard,
      icon: HiHome,
    },
  ],
  [UserRole.Student]: [
    {
      name: 'Dashboard',
      href: PagePath.Dashboard,
      icon: HiHome,
    },
  ],
};

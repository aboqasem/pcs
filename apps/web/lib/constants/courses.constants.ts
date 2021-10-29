import { INavigationItem, ITab } from '@/components';
import { UserRole } from '@pcs/shared-data-access';
import { globalNavigationItems } from './global.constants';

export const courseNavigationItems: { [UserRole.Instructor]: INavigationItem[] } = {
  [UserRole.Instructor]: globalNavigationItems[UserRole.Instructor],
};

export const courseTabs: { [UserRole.Instructor]: ITab[] } = {
  [UserRole.Instructor]: [],
};

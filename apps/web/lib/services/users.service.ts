import { UserDto } from '@myplatform/shared-data-access';
import { GetServerSidePropsContext, NextPageContext } from 'next';
import { bffAxios } from '../config';
import { BffPath } from '../constants';

export async function getCurrentUser(
  ctx?: GetServerSidePropsContext | NextPageContext,
): Promise<UserDto | undefined> {
  const cookie = ctx?.req?.headers.cookie;
  const {
    data: { data: user },
  } = await bffAxios.get(BffPath.Me, (cookie && { headers: { cookie } }) || {});

  return user;
}

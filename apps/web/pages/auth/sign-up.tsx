import { Checkbox, Link, LoadingSpinner, Overlay, TextField } from '@/components/common';
import { BffPath, PagePath } from '@/lib/constants';
import { usePost, useValidated } from '@/lib/hooks';
import { redirectIf } from '@/lib/services/auth.service';
import { SignUpUserDto } from '@myplatform/shared-data-access';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ChangeEventHandler, FormEventHandler, useEffect } from 'react';
import { GoVerified } from 'react-icons/go';
import { HiXCircle } from 'react-icons/hi';

export default function SignUp(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { push, query } = useRouter();
  const intended = (query.intended as string | undefined) ?? '';
  const queryStr = intended && `?intended=${intended}`;
  const {
    data: signUpData,
    setData: setSignUpData,
    validateDataSync,
    errors,
    setErrors,
  } = useValidated(SignUpUserDto, {
    fullName: '',
    preferredName: '',
    email: '',
    username: '',
    password: '',
    rememberMe: false,
  });
  const { sendRequest, data: userData, error, isPending } = usePost(BffPath.SignUp);
  const OverlayIcon = isPending ? LoadingSpinner : GoVerified;

  const onTextFieldChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSignUpData((curr) => ({ ...curr, [e.target.id]: e.target.value }));
  };

  const onCheckboxChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSignUpData((curr) => ({ ...curr, [e.target.id]: e.target.checked }));
  };

  const onFormSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!validateDataSync()) {
      return;
    }

    await sendRequest(signUpData);
  };

  useEffect(() => {
    if (userData) {
      const path = intended || PagePath.Dashboard;
      push(path);
    }
  }, [userData, push, intended]);

  useEffect(() => {
    if (error) {
      if (Array.isArray(error)) {
        return setErrors(error);
      }
      setErrors(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <Head>
        <title>Sign up to MyPlatform</title>
      </Head>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <img
            className="w-auto h-12 mx-auto"
            src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
            alt="My Platform's Logo"
          />
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">Sign up</h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Existing user?{' '}
          <Link
            href={`${PagePath.SignIn}${queryStr}`}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onFormSubmit}>
            <TextField
              id="fullName"
              title="Full name"
              value={signUpData.fullName}
              onChange={onTextFieldChange}
              autoComplete="name"
              errors={errors?.fullName}
            />
            <TextField
              id="preferredName"
              title="What should we call you?"
              value={signUpData.preferredName}
              onChange={onTextFieldChange}
              autoComplete="given-name"
              errors={errors?.preferredName}
            />
            <TextField
              id="email"
              title="Email address"
              value={signUpData.email}
              onChange={onTextFieldChange}
              autoComplete="email"
              errors={errors?.email}
            />
            <TextField
              id="username"
              title="Username"
              value={signUpData.username}
              onChange={onTextFieldChange}
              autoComplete="username"
              errors={errors?.username}
            />
            <TextField
              id="password"
              title="Password"
              value={signUpData.password}
              onChange={onTextFieldChange}
              type="password"
              autoComplete="new-password"
              errors={errors?.password}
            />
            <Checkbox
              id="rememberMe"
              title="Remember me"
              checked={signUpData.rememberMe}
              onChange={onCheckboxChange}
            />

            {!errors && typeof error === 'string' && (
              <div className="p-4 rounded-md bg-red-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HiXCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isPending || !!userData}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm disabled:opacity-50 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </button>
            </div>
          </form>

          {(isPending || userData) && (
            <Overlay>
              <OverlayIcon className="w-10 h-10 text-blue-700" />
            </Overlay>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Record<string, never>> = async (ctx) => {
  const redirectAndUser = await redirectIf(ctx, {
    auth: PagePath.Dashboard,
  });
  if (redirectAndUser[0]) {
    return { redirect: redirectAndUser[0] };
  }

  return {
    props: {},
  };
};

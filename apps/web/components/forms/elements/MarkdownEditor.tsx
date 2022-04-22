import { classNames } from '@/lib/utils/style.utils';
import { TReplace } from '@pcs/shared-data-access';
import 'easymde/dist/easymde.min.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { memo, useCallback, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UnpackNestedValue,
  useController,
} from 'react-hook-form';
import { HiExclamationCircle } from 'react-icons/hi';
import ReactMarkdown from 'react-markdown';
import { SimpleMDEReactProps } from 'react-simplemde-editor';
import { FormField } from './FormField';

// eslint-disable-next-line react-memo/require-memo -- false positive
const Editor = dynamic(() => import('react-simplemde-editor'), {
  ssr: false,
  loading: () => (
    <input
      className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none sm:text-sm h-[300px]"
      disabled
    />
  ),
});

export type TMarkdownEditorProps<TFieldValues extends FieldValues = FieldValues> = TReplace<
  SimpleMDEReactProps,
  {
    name: string;
    label: string;
    defaultValue?: string;
    onBlur?: never;
    onChange?: never;
    control: Control<TFieldValues>;
    className?: never;
  } & {
    label: string;
    required?: boolean;
  }
>;

export const MarkdownEditor = memo(function <TFieldValues extends FieldValues = FieldValues>({
  label,
  required,
  control,
  defaultValue,
  ...props
}: TMarkdownEditorProps<TFieldValues>) {
  const name = props.name as Path<TFieldValues>;
  const id = props.id ?? name;

  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue as UnpackNestedValue<PathValue<TFieldValues, Path<TFieldValues>>>,
  });

  const onChange = useCallback<Exclude<SimpleMDEReactProps['onChange'], undefined>>(
    (value) => {
      field.onChange(value);
    },
    [field],
  );

  const onBlur = useCallback<Exclude<SimpleMDEReactProps['onBlur'], undefined>>(
    (_ev) => {
      field.onBlur();
    },
    [field],
  );

  const options = useMemo<EasyMDE.Options>(
    () => ({
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading-1',
        'heading-2',
        'heading-3',
        '|',
        'code',
        'unordered-list',
        'ordered-list',
        'horizontal-rule',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ],
      maxHeight: '300px',
      ...props.options,
      autoDownloadFontAwesome: false,
      uploadImage: true,
      imageUploadFunction: (file, onSuccess, onError) => {
        if (!file.type.startsWith('image/')) {
          return onError('Drop only images');
        }
        // FIXME: temporary local upload
        const URL = window.URL || window.webkitURL;
        const blob = new Blob([file], { type: file.type });
        const url = URL.createObjectURL(blob);
        onSuccess(`${url}#${file.name}`);
      },
      previewRender: (markdown) => {
        return ReactDOMServer.renderToStaticMarkup(
          <article className="block px-4 py-3 text-sm prose rounded-md prose-neutral bg-gray-50">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>,
        );
      },
    }),
    [props.options],
  );

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>

      <FormField name={name} control={control}>
        {({ errors }) => (
          <div>
            <div className="flex justify-between">
              <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
              </label>

              {!required && (
                <span className="block text-sm text-gray-500" id={`${id}-optional`}>
                  Optional
                </span>
              )}
            </div>

            <div className="relative mt-1">
              <Editor
                {...props}
                id={id}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={!!errors}
                value={field.value}
                options={options}
                aria-describedby={errors ? `${id}-error` : undefined}
                className={classNames(
                  'block w-full appearance-none focus:outline-none sm:text-sm',
                  errors
                    ? 'pr-10 text-red-900 placeholder-red-300 border-red-300 focus:ring-red-500 focus:border-red-500 caret-red-500'
                    : 'placeholder-gray-400 border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                )}
              />

              {/* Right side icon for errors or actions */}
              {errors && (
                <div className="absolute top-0 right-0 pt-2 mr-3">
                  <HiExclamationCircle
                    className="w-5 h-5 text-red-500 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* Errors list below the field */}
            {errors && (
              <div className="mt-2 text-sm text-red-700">
                <ul id={`${id}-error`} className="pl-5 space-y-1 list-disc">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </FormField>
    </>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

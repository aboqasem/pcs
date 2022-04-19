import { FormField } from '@/components/forms/elements/FormField';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Editor, { EditorProps, Monaco } from '@monaco-editor/react';
import { TReplace } from '@pcs/shared-data-access';
import type { editor, IDisposable, languages } from 'monaco-editor';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UnpackNestedValue,
  useController,
} from 'react-hook-form';

export const supportedRuntimes = Object.freeze([
  'C++ (GCC)' as const,
  'C (GCC)' as const,
  'Java' as const,
  'Python' as const,
  'JavaScript (Node.js)' as const,
  'TypeScript (Node.js)' as const,
  'JavaScript (Deno)' as const,
  'TypeScript (Deno)' as const,
  'Go' as const,
]);

export type TCodeEditorProps<TFieldValues extends FieldValues = FieldValues> = TReplace<
  EditorProps,
  {
    language?: typeof supportedRuntimes[number];
  }
> & {
  name: string;
  form?: string;
  canSubmit?: boolean;
  label: string;
  control: Control<TFieldValues>;
};

let completionDisposables: [
  languageSelector: languages.LanguageSelector,
  disposable: IDisposable,
][];

let completions:
  | [
      languageSelector: languages.LanguageSelector,
      items: Pick<languages.CompletionItem, 'label' | 'documentation' | 'insertText'>[],
    ][]
  | undefined = [
  [
    'java',
    [
      {
        label: 'class',
        documentation: 'Java class',
        insertText: ['${2:public} class ${1:ClassName} {', '\t$3', '}'].join('\n'),
      },
      {
        label: 'main',
        documentation: 'Main method',
        insertText: ['public static void main(String[] args) {', '\t$2', '}'].join('\n'),
      },
      {
        label: 'sout',
        documentation: 'Prints a string to System.out',
        insertText: 'System.out.println($1);',
      },
      {
        label: 'scanner',
        documentation: 'Creates a Scanner instance',
        insertText:
          'Scanner ${1:scanner} = new Scanner(${2:System.in});${4: // add ${3:import java.util.Scanner;}}',
      },
    ],
  ],
  [
    'cpp',
    [
      {
        label: 'using namespace',
        documentation: 'Using namespace statement',
        insertText: 'using namespace $1;\n',
      },
      {
        label: 'class',
        documentation: 'C++ class',
        insertText: ['class ${1:ClassName} {', '\t$2', '};'].join('\n'),
      },
      {
        label: 'cout',
        documentation: 'Prints to stdout',
        insertText: 'cout << $1;',
      },
      { label: 'cin', documentation: 'Reads from stdin', insertText: 'cin >> $1;' },
    ],
  ],
  [
    'c',
    [
      {
        label: 'printf',
        documentation: 'Prints to stdout',
        insertText: 'printf($1);',
      },
    ],
  ],
  [
    ['c', 'cpp'],
    [
      { label: 'include', documentation: 'Include statement', insertText: '#include $1\n' },
      {
        label: 'main',
        documentation: 'Main function',
        insertText: ['int main() {', '\t$1', '\treturn 0;', '}'].join('\n'),
      },
    ],
  ],
  [
    ['java', 'cpp', 'c', 'javascript', 'typescript'],
    [
      {
        label: 'if',
        documentation: 'If statement',
        insertText: ['if ($1) {', '\t$2', '}'].join('\n'),
      },
      {
        label: 'else',
        documentation: 'Else statement',
        insertText: ['else {', '\t$1', '}'].join('\n'),
      },
      {
        label: 'while',
        documentation: 'While loop',
        insertText: ['while ($1) {', '\t$2', '}'].join('\n'),
      },
      {
        label: 'dowhile',
        documentation: 'Do-while loop',
        insertText: ['do {', '\t$1', '} while ($2);'].join('\n'),
      },
      {
        label: 'for',
        documentation: 'For loop',
        insertText: ['for (int ${1:i} = ${2:0}; $1 ${3:<} $4; ++$1) {', '\t$5', '}'].join('\n'),
      },
      {
        label: 'switch',
        documentation: 'Switch statement',
        insertText: [
          'switch ($1) {',
          '\tcase $2:',
          '\t\t$3',
          '\t\tbreak;',
          '\tdefault:',
          '\t\tbreak;',
          '}',
        ].join('\n'),
      },
      {
        label: 'case',
        documentation: 'Switch case statement',
        insertText: ['case $1:', '\t$2', '\tbreak;'].join('\n'),
      },
    ],
  ],
];

export const CodeEditor = memo(function <TFieldValues extends FieldValues = FieldValues>({
  name,
  form,
  label,
  canSubmit,
  control,
  defaultValue,
  onChange: onChangeProp,
  ...props
}: TCodeEditorProps<TFieldValues>) {
  const language = useMemo(
    () => props.language?.split(' ')[0]?.toLocaleLowerCase().replace('c++', 'cpp'),
    [props.language],
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSubmitRef = useRef(canSubmit);

  const { field } = useController({
    name: name as Path<TFieldValues>,
    control,
    defaultValue: defaultValue as UnpackNestedValue<PathValue<TFieldValues, Path<TFieldValues>>>,
  });

  const onChange = useCallback<Exclude<EditorProps['onChange'], undefined>>(
    (value, _ev) => {
      field.onChange(value);
      onChangeProp?.(value, _ev);
    },
    [field, onChangeProp],
  );

  useEffect(() => {
    canSubmitRef.current = canSubmit;
  }, [canSubmit]);

  const onMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    if (!completionDisposables && completions) {
      completionDisposables = completions.map(([languageSelector, items]) => {
        const disposable = monaco.languages.registerCompletionItemProvider(languageSelector, {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            };
            return {
              suggestions: items.map(({ label, documentation, insertText }) => ({
                range,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                label,
                documentation,
                insertText,
              })),
            };
          },
        });

        return [languageSelector, disposable];
      });

      completions = undefined;
    }

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.Enter, () => {
      if (canSubmitRef.current === undefined || canSubmitRef.current) {
        textareaRef.current?.form?.requestSubmit();
      }
    });
  }, []);

  const loading = useMemo(() => <LoadingSpinner className="w-10 h-10" />, []);

  return (
    <FormField name={name as Path<TFieldValues>} control={control}>
      {() => (
        <div className="flex flex-col flex-1">
          <div className="flex justify-between">
            <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
              {label}
            </label>
          </div>

          <div className="flex-1">
            <Editor
              theme="vs-dark"
              loading={loading}
              defaultValue={defaultValue}
              value={field.value}
              onChange={onChange}
              onMount={onMount}
              {...props}
              className={`max-h-screen ${props.className || ''}`}
              language={language}
            />

            <textarea
              readOnly
              ref={textareaRef}
              name={name}
              form={form}
              value={field.value}
              hidden
            ></textarea>
          </div>
        </div>
      )}
    </FormField>
  );
});

CodeEditor.displayName = 'CodeEditor';

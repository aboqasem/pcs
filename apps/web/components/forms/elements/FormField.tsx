import { TPropsErrors } from '@pcs/shared-data-access';
import { memo, useMemo } from 'react';
import { Control, FieldValues, Path, useFormState } from 'react-hook-form';

interface IFormFieldChildrenProps {
  errors?: string[];
}

export type TFormFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  children(props: IFormFieldChildrenProps): void;
};

export const FormField = memo(function <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  children,
}: TFormFieldProps<TFieldValues>) {
  const {
    errors: { [name]: error },
  } = useFormState({ control, name });

  const errors = useMemo(() => {
    const errors = (error as TPropsErrors<TFieldValues>[typeof name])?.message?.split('\n');
    return errors && errors.length > 0 ? errors : undefined;
  }, [error]);

  return <>{children({ errors })}</>;
});

FormField.displayName = 'FormField';

import {
  isEmail,
  IsNotEmpty,
  Length,
  Matches,
  registerDecorator,
  validateSync,
} from 'class-validator';

export async function isUsername(value: string) {
  const uu = new (await import('../users/mixins').then(({ UserUsername }) => UserUsername))();
  uu.username = value;

  return validateSync(uu).length === 0;
}

export function IsUsernameOrEmail(): PropertyDecorator {
  return function (object: Object, propertyName: string | symbol) {
    registerDecorator({
      name: 'isUsernameOrEmail',
      target: object.constructor,
      async: true,
      propertyName: propertyName.toString(),
      options: { message: '$property must be either a username or an email' },
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' &&
            ((value.includes('@') && isEmail(value)) || isUsername(value))
          );
        },
      },
    });
  };
}

export function IsUsername(): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Length(3, 30)(target, propertyKey);

    Matches(/^[a-zA-Z0-9._]*$/, {
      message:
        '$property may only consist of Latin letters (A to Z), Arabic numerals (0 to 9), and special characters (._)',
    })(target, propertyKey);

    Matches(/^(?![^_.]+[_.]{2,}[^_.]+).*$/, {
      message: '$property should not contain subsequent special characters',
    })(target, propertyKey);

    Matches(/^(?!^[._]+.*)(?!.*[._]+$).*$/, {
      message: '$property should not start nor end with a special character',
    })(target, propertyKey);

    IsNotEmpty()(target, propertyKey);
  };
}

export function IsRealName(minLength: number, maxLength: number): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol) {
    Length(minLength, maxLength)(target, propertyKey);

    Matches(/^[A-Za-z\-.' ]*$/, {
      message: "$property may only consist of Latin letters (A to Z) and punctuation marks ('-.)",
    })(target, propertyKey);

    Matches(/^(?![^\-.' ]+[\-.' ]{2,}[^\-.' ]+).*$/, {
      message: '$property should not contain subsequent punctuation marks',
    })(target, propertyKey);

    Matches(/^(?!^[\-.' ]+.*)(?!.*[\-.' ]+$).*$/, {
      message: '$property should not start nor end with a punctuation mark',
    })(target, propertyKey);

    IsNotEmpty()(target, propertyKey);
  };
}

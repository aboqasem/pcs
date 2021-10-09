export enum EmailType {
  NewUser = 'd-2d2027af9f7549ba9d1cb66def9343b9',
  PasswordRetrieval = 'd-88290cd177ca49f79b08c71e886c2240',
}

export type TEmail<T extends EmailType> = {
  to: string;
} & (
  | {
      type: T;
      data: TEmailData[T];
      html?: never;
      text?: never;
      subject?: never;
    }
  | ({
      type?: never;
      data?: never;
      subject: string;
    } & ({ html: string; text?: never } | { html?: never; text: string }))
);

type TEmailData = {
  [EmailType.NewUser]: {
    fullName: string;
    username: string;
    password: string;
    role: string;
    signInUrl: string;
  };
  [EmailType.PasswordRetrieval]: {
    fullName: string;
    password: string;
    signInUrl: string;
  };
};

export enum EmailTemplate {
  NewUser = 'd-2d2027af9f7549ba9d1cb66def9343b9',
  PasswordRetrieval = 'd-88290cd177ca49f79b08c71e886c2240',
  CourseEnrollment = 'd-aa3c84608d814eb2a51d446c0ff3ba0e',
}

export type TEmail<T extends EmailTemplate> = {
  to: string;
} & (
  | {
      template: T;
      data: TEmailData[T];
      html?: never;
      text?: never;
      subject?: never;
    }
  | ({
      template?: never;
      data?: never;
      subject: string;
    } & ({ html: string; text?: never } | { html?: never; text: string }))
);

type TEmailData = {
  [EmailTemplate.NewUser]: {
    fullName: string;
    username: string;
    password: string;
    role: string;
    signInUrl: string;
  };
  [EmailTemplate.PasswordRetrieval]: {
    fullName: string;
    password: string;
    signInUrl: string;
  };
  [EmailTemplate.CourseEnrollment]: {
    fullName: string;
    courseTitle: string;
    courseUrl: string;
  };
};

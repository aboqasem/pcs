import { Injectable, Logger } from '@nestjs/common';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { config } from 'src/config/config';
import { EmailType, TEmail } from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
  }

  async send<T extends EmailType = any>(...emails: TEmail<T>[]): Promise<boolean> {
    return sgMail
      .send(emails.map(this._constructEmail))
      .then(() => {
        this.logger.debug(`Sent emails: ${JSON.stringify(emails, null, 2)}`);
        return true;
      })
      .catch((error) => {
        this.logger.error(error);
        return false;
      });
  }

  private _constructEmail({ to, type, data, subject, text, html }: TEmail<any>): MailDataRequired {
    return {
      from: config.SENDGRID_FROM,
      to,
      subject,
      // text would be defined if the message is supposed to be in text
      text: text!,
      html,
      mailSettings: { sandboxMode: { enable: config.SENDGRID_SANDBOX } },
      templateId: type,
      dynamicTemplateData: data,
      hideWarnings: true,
    };
  }
}

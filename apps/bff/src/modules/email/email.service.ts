import { Injectable, Logger } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { config } from 'src/config/config';
import { EmailTemplate, TEmail } from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly sgMail = new MailService();

  constructor() {
    this.sgMail.setApiKey(config.SENDGRID_API_KEY);
  }

  async send<T extends TEmail<EmailTemplate>>(...emails: T[]): Promise<boolean> {
    return this.sgMail
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

  private _constructEmail({
    to,
    template,
    data,
    subject,
    text,
    html,
  }: TEmail<any>): MailDataRequired {
    return {
      from: config.SENDGRID_FROM,
      to,
      subject,
      // text would be defined if the message is supposed to be in text
      text: text!,
      html,
      mailSettings: { sandboxMode: { enable: config.SENDGRID_SANDBOX } },
      templateId: template,
      dynamicTemplateData: data,
      hideWarnings: true,
    };
  }
}
